import { createContext, useContext } from 'react'
import type { TrackedJob } from './job.types'

export interface JobsRegistry {
  /** Jobs the app is tracking, newest first. */
  jobs: TrackedJob[]
  /** Starts tracking a newly accepted job. */
  trackJob: (job: TrackedJob) => void
  /** Looks up a tracked job's local metadata. */
  getJob: (jobId: string) => TrackedJob | undefined
}

export const JobsContext = createContext<JobsRegistry | null>(null)

/**
 * Access to the tracked-jobs registry.
 *
 * Holds only client-side metadata — each job's live status comes from its own
 * query, so jobs never share a single loading or error state.
 */
export function useJobsRegistry(): JobsRegistry {
  const registry = useContext(JobsContext)

  if (!registry) {
    throw new Error('useJobsRegistry must be used within a JobsProvider.')
  }

  return registry
}
