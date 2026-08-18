import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { TrackedJob } from './job.types'
import { JobsContext } from './jobsContext'

/**
 * Holds the list of jobs submitted in this session.
 *
 * Intentionally in-memory: the mock service also keeps its jobs in memory, so
 * persisting ids across a reload would only produce requests for jobs the
 * service no longer knows about.
 */
export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<TrackedJob[]>([])

  const trackJob = useCallback((job: TrackedJob) => {
    // Newest first, and never replace the jobs already being tracked.
    setJobs((current) => [job, ...current])
  }, [])

  const getJob = useCallback(
    (jobId: string) => jobs.find((job) => job.id === jobId),
    [jobs],
  )

  const value = useMemo(
    () => ({ jobs, trackJob, getJob }),
    [jobs, trackJob, getJob],
  )

  return <JobsContext value={value}>{children}</JobsContext>
}
