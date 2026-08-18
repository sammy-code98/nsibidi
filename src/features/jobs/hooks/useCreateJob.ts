import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { jobsApi } from '@/api/jobs'
import type { ApiJob, CreateJobResponse } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeSubmissionFailure } from '../job.errors'
import { jobKeys } from '../job.keys'

interface UseCreateJobOptions {
  /** Called once the service has accepted the job. */
  onSuccess?: (job: CreateJobResponse, file: File) => void
}

interface UseCreateJobResult {
  submit: (file: File) => void
  isSubmitting: boolean
  /** Why the last submission failed, described for the user. */
  error: FailureDescription | null
  /** Clears any recorded failure. */
  reset: () => void
}

/**
 * Submits an image as a processing job.
 *
 * On success the new job's status is written straight into the query cache, so
 * the job appears as "Queued" immediately rather than after the first poll.
 */
export function useCreateJob(
  options: UseCreateJobOptions = {},
): UseCreateJobResult {
  const { onSuccess } = options
  const queryClient = useQueryClient()

  // A disabled button is not enough on its own: `isPending` lands a render
  // later, so a fast double-click could fire two requests. This ref closes
  // that window synchronously.
  const inFlight = useRef(false)

  const mutation = useMutation({
    mutationFn: (file: File) => jobsApi.create(file),
    onSuccess: (job, file) => {
      queryClient.setQueryData<ApiJob>(jobKeys.detail(job.job_id), {
        job_id: job.job_id,
        status: job.status,
        result: null,
        error: null,
      })

      onSuccess?.(job, file)
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  const { mutate } = mutation

  const submit = useCallback(
    (file: File) => {
      if (inFlight.current) {
        return
      }

      inFlight.current = true
      mutate(file)
    },
    [mutate],
  )

  return {
    submit,
    isSubmitting: mutation.isPending,
    error: mutation.error ? describeSubmissionFailure(mutation.error) : null,
    reset: mutation.reset,
  }
}
