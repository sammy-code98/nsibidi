import { createContext, useContext } from 'react'
import type { TrackedJob } from './job.types'

export interface JobsRegistry {
  jobs: TrackedJob[];
  trackJob: (job: TrackedJob) => void;
  getJob: (jobId: string) => TrackedJob | undefined;
}

export const JobsContext = createContext<JobsRegistry | null>(null)


export function useJobsRegistry(): JobsRegistry {
  const registry = useContext(JobsContext)

  if (!registry) {
    throw new Error('useJobsRegistry must be used within a JobsProvider.')
  }

  return registry
}
