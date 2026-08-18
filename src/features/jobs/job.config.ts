/**
 * How often an unfinished job is re-checked, in milliseconds.
 *
 * Frequent enough that a status change is noticed promptly, slow enough that a
 * page full of jobs does not flood the service.
 */
export const JOB_POLL_INTERVAL_MS = 2_500

/**
 * How long a job may run before the UI says it is taking longer than usual.
 *
 * Chosen to sit above a typical run so the notice means something: it is not a
 * timeout, and nothing about the job changes when it is crossed.
 */
export const LONG_RUNNING_THRESHOLD_MS = 20_000
