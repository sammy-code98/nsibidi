/**
 * How often an unfinished job is re-checked, in milliseconds.
 *
 * Frequent enough that a status change is noticed promptly, slow enough that a
 * page full of jobs does not flood the service.
 */
export const JOB_POLL_INTERVAL_MS = 2_500
