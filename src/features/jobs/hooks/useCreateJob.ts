import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { jobsApi } from '@/api/jobs'
import type { ApiJob, CreateJobResponse } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeSubmissionFailure } from '../job.errors'
import { jobKeys } from '../job.keys'

interface UseCreateJobOptions {
  onSuccess?: (job: CreateJobResponse, file: File) => void;
}

interface UseCreateJobResult {
  submit: (file: File) => void;
  isSubmitting: boolean;
  error: FailureDescription | null;
  reset: () => void;
}


export function useCreateJob(
  options: UseCreateJobOptions = {},
): UseCreateJobResult {
  const { onSuccess } = options;
  const queryClient = useQueryClient();

  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationFn: (file: File) => jobsApi.create(file),
    onSuccess: (job, file) => {
      queryClient.setQueryData<ApiJob>(jobKeys.detail(job.job_id), {
        job_id: job.job_id,
        status: job.status,
        result: null,
        error: null,
      });

      onSuccess?.(job, file);
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const { mutate } = mutation;

  const submit = useCallback(
    (file: File) => {
      if (inFlight.current) {
        return;
      }

      inFlight.current = true;
      mutate(file);
    },
    [mutate],
  );

  return {
    submit,
    isSubmitting: mutation.isPending,
    error: mutation.error ? describeSubmissionFailure(mutation.error) : null,
    reset: mutation.reset,
  };
}
