import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { TrackedJob } from './job.types'
import { JobsContext } from './jobsContext'


export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<TrackedJob[]>([])

  const trackJob = useCallback((job: TrackedJob) => {
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
