/** Lifecycle states a job moves through, as returned by the API. */
export type JobStatus = 'queued' | 'processing' | 'complete' | 'failed'

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

export interface TrackedJob {
  id: string
  filename: string
  file?: File
  createdAt: string
}

/** Payload returned by the result endpoint once a job is complete. */
export interface JobResult {
  job_id: string;
  filename: string;
  result: string;
  completed_at: string;
  processing_time_ms: number;
}
