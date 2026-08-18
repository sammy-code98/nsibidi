import type { JobStatus } from '@/features/jobs/job.types'
import { MOCK_CONFIG, detectScenario } from './config'
import type { ScenarioKind } from './config'

/** Reasons a job can fail, phrased the way a real service would report them. */
const FAILURE_REASONS = [
  'The image could not be decoded. It may be corrupted or incompletely uploaded.',
  'Processing exceeded the memory available for this image.',
  'The processing pipeline rejected this image format variant.',
] as const

/**
 * A job held by the mock service.
 *
 * Status is not stored. Instead each job records *when* it should change, and
 * the current status is derived on read — so progress continues correctly even
 * if the tab is backgrounded and timers are throttled, and no timer can leak.
 */
export interface MockJob {
  id: string
  filename: string
  createdAt: number
  /** Timestamp at which the job stops being queued. */
  startsProcessingAt: number
  /** Timestamp at which the job reaches its terminal status. */
  finishesAt: number
  /** The terminal status this job is destined for. */
  outcome: Extract<JobStatus, 'complete' | 'failed'>
  /** Failure detail, present only when `outcome` is `failed`. */
  error: string | null
  /** URL the UI can render as the processed image, once complete. */
  resultUrl: string
  /** The uploaded bytes, served back by the image endpoint. */
  imageBytes: ArrayBuffer
  imageType: string
  /** Forces the result endpoint to fail, to exercise result-error handling. */
  resultIsUnavailable: boolean
}

const jobs = new Map<string, MockJob>()

function randomBetween(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs)
}

function pick<T>(values: readonly T[], fallback: T): T {
  return values[Math.floor(Math.random() * values.length)] ?? fallback
}

/** Random delay used to keep every mock response feeling like a real one. */
export function responseDelayMs(): number {
  const { minMs, maxMs } = MOCK_CONFIG.responseLatency

  return randomBetween(minMs, maxMs)
}

function createJobId(): string {
  return `job_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

/**
 * Registers a new job and schedules its lifecycle.
 *
 * The uploaded bytes are kept so the image endpoint can serve them back. An
 * object URL would be simpler, but a `blob:` URL created here does not survive
 * being handed to the page through the service worker, so the mock exposes a
 * real URL the browser can actually fetch.
 */
export async function createMockJob(file: File): Promise<MockJob> {
  const scenario: ScenarioKind | null = detectScenario(file.name)

  // Only unforced jobs roll the dice on speed: a job named to demonstrate
  // failure should not also randomly take 45 seconds to get there.
  const isSlow =
    scenario === 'slow'
      ? true
      : scenario !== null
        ? false
        : Math.random() < MOCK_CONFIG.slowRate

  // A forced scenario must be reliable: `badResult` and `succeed` both need
  // the job to complete — for one the result request is what fails, for the
  // other nothing does — so a random failure must not override them.
  const willFail =
    scenario === 'fail'
      ? true
      : scenario === 'badResult' || scenario === 'succeed'
        ? false
        : Math.random() < MOCK_CONFIG.failureRate

  const now = Date.now()
  const queuedFor = randomBetween(
    MOCK_CONFIG.queued.minMs,
    MOCK_CONFIG.queued.maxMs,
  )
  const processingWindow = isSlow
    ? MOCK_CONFIG.slowProcessing
    : MOCK_CONFIG.processing
  const processingFor = randomBetween(
    processingWindow.minMs,
    processingWindow.maxMs,
  )

  const startsProcessingAt = now + queuedFor
  const id = createJobId()

  const job: MockJob = {
    id,
    filename: file.name,
    createdAt: now,
    startsProcessingAt,
    finishesAt: startsProcessingAt + processingFor,
    outcome: willFail ? 'failed' : 'complete',
    error: willFail ? pick(FAILURE_REASONS, FAILURE_REASONS[0]) : null,
    resultUrl: `/jobs/${id}/image`,
    imageBytes: await file.arrayBuffer(),
    imageType: file.type || 'application/octet-stream',
    resultIsUnavailable: scenario === 'badResult',
  }

  jobs.set(job.id, job)

  return job
}

/** Current status of a job, derived from how much time has passed. */
export function deriveStatus(job: MockJob, now = Date.now()): JobStatus {
  if (now < job.startsProcessingAt) {
    return 'queued'
  }

  if (now < job.finishesAt) {
    return 'processing'
  }

  return job.outcome
}

export function getMockJob(jobId: string): MockJob | undefined {
  return jobs.get(jobId)
}

/** Removes every job. Used by tests to isolate runs. */
export function resetMockJobs(): void {
  jobs.clear()
}
