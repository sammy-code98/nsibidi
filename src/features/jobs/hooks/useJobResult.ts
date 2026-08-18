import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/api/jobs'
import type { JobResult } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeResultFailure } from '../job.errors'
import { jobKeys } from '../job.keys'

interface UseJobResultOptions {
  enabled: boolean;
}

interface UseJobResultResult {
  result: JobResult | undefined;
  isLoading: boolean;
  error: FailureDescription | null;
  retry: () => void;
}


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
