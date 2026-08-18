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
 * Frontend-only metadata about a job the app is tracking.
 *
 * The API never returns any of this: the original filename for display, the
 * file itself so a failed job can be resubmitted, and when the job was
 * submitted, for ordering and long-running detection.
 *
 * Status deliberately lives elsewhere (the query cache, fed by the API) so
 * there is exactly one place that knows what a job's status is.
 */
export interface TrackedJob {
  id: string
  filename: string
  file?: File
  createdAt: string
}

/** A tracked job combined with the API's current view of it. */
export interface Job extends TrackedJob {
  status: JobStatus
  result: string | null
  error: string | null
}

/** Payload returned by the result endpoint once a job is complete. */
export interface JobResult {
  job_id: string
  filename: string
  /** Displayable URL of the processed image. */
  result: string
  completed_at: string
  processing_time_ms: number
}
