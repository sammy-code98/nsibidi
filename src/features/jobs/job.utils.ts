import type { JobStatus, TrackedJob } from './job.types'
import { TERMINAL_JOB_STATUSES } from './job.types'

/** True once a job has reached a state it will never leave. */
export function isTerminalStatus(status: JobStatus): boolean {
  return (TERMINAL_JOB_STATUSES as readonly JobStatus[]).includes(status)
}

/** True while a job is still expected to change. */
export function isActiveStatus(status: JobStatus): boolean {
  return !isTerminalStatus(status)
}

/**
 * Whether a job can be resubmitted.
 *
 * Retrying re-uploads the original file, so it is only possible for jobs
 * submitted in this session — a job opened by URL has no file to send.
 */
export function canRetryJob(job: TrackedJob): boolean {
  return job.file instanceof File
}
