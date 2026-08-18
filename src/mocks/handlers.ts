import { HttpResponse, delay, http } from 'msw'
import type { ApiJob, CreateJobResponse, JobResult } from '@/features/jobs/job.types'
import { detectScenario } from './config'
import {
  createMockJob,
  deriveStatus,
  getMockJob,
  responseDelayMs,
} from './data'

/**
 * Builds a request pattern for an endpoint.
 *
 * The origin is wildcarded so the same handlers work in the browser, where
 * requests are same-origin, and under `setupServer` in tests, where there is no
 * `location` for a relative path to be resolved against.
 */
function endpoint(path: string): string {
  return `*${path}`
}

function notFound(jobId: string) {
  return HttpResponse.json(
    { error: `No job exists with the id "${jobId}".` },
    { status: 404 },
  )
}

/**
 * Mock implementation of the job API.
 *
 * Deliberately asynchronous: a job is never complete when it is created, and
 * only reaches a terminal status after the simulated processing time has
 * actually elapsed.
 */
export const handlers = [
  /** Accepts an image and queues it. Returns immediately. */
  http.post(endpoint('/jobs'), async ({ request }) => {
    const formData = await request.formData().catch(() => null)
    const file = formData?.get('file')

    if (!(file instanceof File)) {
      await delay(responseDelayMs())

      return HttpResponse.json(
        { error: 'No image was included in the request.' },
        { status: 400 },
      )
    }

    // Simulates the service refusing the upload outright.
    if (detectScenario(file.name) === 'reject') {
      await delay(responseDelayMs())

      return HttpResponse.json(
        { error: 'The processing service is not accepting uploads right now.' },
        { status: 503 },
      )
    }

    const job = createMockJob(file)
    await delay(responseDelayMs())

    return HttpResponse.json<CreateJobResponse>(
      { job_id: job.id, status: 'queued' },
      { status: 202 },
    )
  }),

  /** Reports the current status of a job. */
  http.get(endpoint('/jobs/:jobId'), async ({ params }) => {
    const jobId = String(params.jobId)
    const job = getMockJob(jobId)

    await delay(responseDelayMs())

    if (!job) {
      return notFound(jobId)
    }

    const status = deriveStatus(job)

    return HttpResponse.json<ApiJob>({
      job_id: job.id,
      status,
      result: status === 'complete' ? job.resultUrl : null,
      error: status === 'failed' ? job.error : null,
    })
  }),

  /** Returns the processed result, but only once the job is complete. */
  http.get(endpoint('/jobs/:jobId/result'), async ({ params }) => {
    const jobId = String(params.jobId)
    const job = getMockJob(jobId)

    await delay(responseDelayMs())

    if (!job) {
      return notFound(jobId)
    }

    const status = deriveStatus(job)

    if (status === 'failed') {
      return HttpResponse.json(
        { error: 'This job failed, so it has no result.' },
        { status: 409 },
      )
    }

    if (status !== 'complete') {
      return HttpResponse.json(
        {
          error:
            'This result is not ready yet. The image is still being processed.',
        },
        { status: 409 },
      )
    }

    // Simulates a result that exists but cannot be retrieved.
    if (job.resultIsUnavailable) {
      return HttpResponse.json(
        { error: 'The result could not be retrieved from storage.' },
        { status: 500 },
      )
    }

    return HttpResponse.json<JobResult>({
      job_id: job.id,
      filename: job.filename,
      result: job.resultUrl,
      completed_at: new Date(job.finishesAt).toISOString(),
      processing_time_ms: Math.round(job.finishesAt - job.startsProcessingAt),
    })
  }),
]
