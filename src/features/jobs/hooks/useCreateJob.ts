import { useCallback, useEffect, useRef, useState } from 'react'
import { jobsApi } from '@/api/jobs'
import type { CreateJobResponse } from '../job.types'
import type { FailureDescription } from '../job.errors'
import { describeSubmissionFailure } from '../job.errors'

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
 * Owns only the submission itself — the caller decides what to do with the
 * accepted job.
 */
export function useCreateJob(
  options: UseCreateJobOptions = {},
): UseCreateJobResult {
  const { onSuccess } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<FailureDescription | null>(null)

  // A disabled button is not enough on its own: `isSubmitting` lands a render
  // later, so a fast double-click could fire two requests. This ref closes
  // that window synchronously.
  const inFlight = useRef(false)

  // Guards against setting state after the component has gone away.
  const isMounted = useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const submit = useCallback(
    (file: File) => {
      if (inFlight.current) {
        return
      }

      inFlight.current = true
      setIsSubmitting(true)
      setError(null)

      jobsApi
        .create(file)
        .then((job) => {
          if (!isMounted.current) return
          onSuccess?.(job, file)
        })
        .catch((cause: unknown) => {
          if (!isMounted.current) return
          setError(describeSubmissionFailure(cause))
        })
        .finally(() => {
          inFlight.current = false
          if (isMounted.current) {
            setIsSubmitting(false)
          }
        })
    },
    [onSuccess],
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { submit, isSubmitting, error, reset }
}
