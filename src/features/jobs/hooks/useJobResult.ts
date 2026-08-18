import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/api/jobs'
import type { JobResult } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeResultFailure } from '../job.errors'
import { jobKeys } from '../job.keys'

interface UseJobResultOptions {
  /**
   * Whether the job has finished. The request is not made until this is true,
   * so the app never asks for a result the service would refuse to give.
   */
  enabled: boolean
}

interface UseJobResultResult {
  result: JobResult | undefined
  /** True while the result is being fetched for the first time. */
  isLoading: boolean
  /** Why the result could not be loaded, described for the user. */
  error: FailureDescription | null
  retry: () => void
}

/**
 * Fetches a completed job's result.
 *
 * A result never changes once produced, so it is cached indefinitely and is
 * not re-requested on remount or navigation.
 */
export function useJobResult(
  jobId: string,
  { enabled }: UseJobResultOptions,
): UseJobResultResult {
  const query = useQuery({
    queryKey: jobKeys.result(jobId),
    queryFn: () => jobsApi.getResult(jobId),
    enabled,
    staleTime: Infinity,
  })

  return {
    result: query.data,
    isLoading: enabled && query.isPending,
    error: query.error ? describeResultFailure(query.error) : null,
    retry: () => void query.refetch(),
  }
}
