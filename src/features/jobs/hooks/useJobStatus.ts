import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/api/jobs'
import type { ApiJob, JobStatus } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeStatusFailure } from '../job.errors'
import { JOB_POLL_INTERVAL_MS } from '../job.config'
import { jobKeys } from '../job.keys'
import { isTerminalStatus } from '../job.utils'

interface UseJobStatusResult {
  job: ApiJob | undefined;
  status: JobStatus | undefined;
  isPending: boolean;
  isError: boolean;
  error: FailureDescription | null;
  isPolling: boolean;
  refetch: () => void;
}


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
