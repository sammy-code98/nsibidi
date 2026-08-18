/**
 * Query keys for job data.
 *
 * Centralised so a status query and the cache write that seeds it can never
 * disagree about which key a job lives under.
 */
export const jobKeys = {
  all: ['jobs'] as const,
  detail: (jobId: string) => ['jobs', jobId] as const,
  result: (jobId: string) => ['jobs', jobId, 'result'] as const,
}
