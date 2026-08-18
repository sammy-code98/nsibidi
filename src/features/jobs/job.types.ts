/** Lifecycle states a job moves through, as returned by the API. */
export type JobStatus = 'queued' | 'processing' | 'complete' | 'failed'

/** Statuses from which a job can still change. */
export const ACTIVE_JOB_STATUSES = ['queued', 'processing'] as const

/** Statuses a job never leaves. */
export const TERMINAL_JOB_STATUSES = ['complete', 'failed'] as const

/** A job exactly as the API represents it. */
export interface ApiJob {
  job_id: string
  status: JobStatus
  result: string | null
  error: string | null
}

/** The immediate response to submitting a job. */
export interface CreateJobResponse {
  job_id: string
  status: JobStatus
}

/**
 * A job as the app tracks it.
 *
 * Carries frontend-only metadata the API does not return: the original
 * filename for display, the file itself so a failed job can be resubmitted,
 * and timestamps for ordering and long-running detection.
 */
export interface Job {
  id: string
  filename: string
  file?: File
  status: JobStatus
  result?: string | null
  error?: string | null
  createdAt: string
  updatedAt: string
}
