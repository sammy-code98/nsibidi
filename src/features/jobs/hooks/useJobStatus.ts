import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/api/jobs'
import type { ApiJob, JobStatus } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeStatusFailure } from '../job.errors'
import { JOB_POLL_INTERVAL_MS } from '../job.config'
import { jobKeys } from '../job.keys'
import { isTerminalStatus } from '../job.utils'

interface UseJobStatusResult {
  /** The service's latest view of the job. */
  job: ApiJob | undefined
  /** Current status, or `undefined` before the first successful read. */
  status: JobStatus | undefined
  /** True only before any status is known. */
  isPending: boolean
  /** True when the status could not be read. */
  isError: boolean
  /** Why the status could not be read, described for the user. */
  error: FailureDescription | null
  /** True while the job is still being re-checked. */
  isPolling: boolean
  refetch: () => void
}

/**
 * Tracks one job's status, re-checking it until it settles.
 *
 * When polling has given up after a failure, calling `refetch` resumes it:
 * a successful read clears the error state, which re-enables the interval.
 *
 * Polling is expressed as a property of the query rather than a timer owned by
 * a component: React Query starts the interval when the first observer mounts
 * and clears it when the last one unmounts, so a card leaving the screen can
 * never leave a request loop behind. The interval also switches itself off the
 * moment the job reaches a terminal status.
 */
export function useJobStatus(jobId: string): UseJobStatusResult {
  const query = useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobsApi.get(jobId),
    refetchInterval: ({ state }) => {
      const status = state.data?.status

      // Complete and failed are final: nothing further can change.
      if (status && isTerminalStatus(status)) {
        return false
      }

      // The query has exhausted its retries and still has no data at all, so
      // the service cannot describe this job — polling it forever would be
      // pointless. A background refetch that fails while data already exists
      // leaves `status` as 'success', so a transient blip keeps polling.
      if (state.status === 'error') {
        return false
      }

      return JOB_POLL_INTERVAL_MS
    },
  })

  const status = query.data?.status

  return {
    job: query.data,
    status,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error ? describeStatusFailure(query.error) : null,
    isPolling: status !== undefined && !isTerminalStatus(status),
    refetch: () => void query.refetch(),
  }
}
