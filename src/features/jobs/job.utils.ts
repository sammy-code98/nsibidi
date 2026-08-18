import type { JobStatus } from './job.types'
import { TERMINAL_JOB_STATUSES } from './job.types'

/** True once a job has reached a state it will never leave. */
export function isTerminalStatus(status: JobStatus): boolean {
  return (TERMINAL_JOB_STATUSES as readonly JobStatus[]).includes(status)
}

/** True while a job is still expected to change. */
export function isActiveStatus(status: JobStatus): boolean {
  return !isTerminalStatus(status)
}
