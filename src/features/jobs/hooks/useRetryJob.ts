import { useCallback } from 'react'
import { useCreateJob } from './useCreateJob'
import type { FailureDescription } from '../job.errors'
import type { CreateJobResponse, TrackedJob } from '../job.types'
import { useJobsRegistry } from '../jobsContext'

interface UseRetryJobOptions {
  /** Called with the newly created job once the service accepts it. */
  onRetried?: (job: CreateJobResponse) => void
}

interface UseRetryJobResult {
  /** Resubmits a failed job's image as a new job. */
  retry: (job: TrackedJob) => void
  isRetrying: boolean
  /** Why the resubmission failed, described for the user. */
  error: FailureDescription | null
}

/**
 * Resubmits a failed job.
 *
 * This deliberately creates a *new* job rather than moving the failed one back
 * to queued: the original attempt really did fail, and rewriting its status
 * would erase that from the history the user can see.
 */
export function useRetryJob(
  options: UseRetryJobOptions = {},
): UseRetryJobResult {
  const { onRetried } = options
  const { trackJob } = useJobsRegistry()

  const handleSuccess = useCallback(
    (created: CreateJobResponse, file: File) => {
      trackJob({
        id: created.job_id,
        filename: file.name,
        file,
        createdAt: new Date().toISOString(),
      })

      onRetried?.(created)
    },
    [onRetried, trackJob],
  )

  const { submit, isSubmitting, error } = useCreateJob({
    onSuccess: handleSuccess,
  })

  const retry = useCallback(
    (job: TrackedJob) => {
      if (job.file) {
        submit(job.file)
      }
    },
    [submit],
  )

  return { retry, isRetrying: isSubmitting, error }
}
