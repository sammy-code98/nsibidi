import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/api/jobs'
import type { ApiJob, JobStatus } from '../job.types'
import { jobKeys } from '../job.keys'

interface UseJobStatusResult {
  /** The service's latest view of the job. */
  job: ApiJob | undefined
  /** Current status, or `undefined` before the first successful read. */
  status: JobStatus | undefined
  /** True only before any status is known. */
  isPending: boolean
  /** True when the status could not be read. */
  isError: boolean
  refetch: () => void
}

/**
 * Tracks one job's status.
 *
 * Scoped to a single job so that every job has its own request, cache entry
 * and error state — one job failing never affects how another is displayed.
 */
export function useJobStatus(jobId: string): UseJobStatusResult {
  const query = useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobsApi.get(jobId),
  })

  return {
    job: query.data,
    status: query.data?.status,
    isPending: query.isPending,
    isError: query.isError,
    refetch: () => void query.refetch(),
  }
}
