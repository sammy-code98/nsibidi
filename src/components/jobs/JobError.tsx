import type { ReactNode } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'

interface JobErrorProps {
  /** The reason reported by the service, if it gave one. */
  reason?: string | null
  /** Recovery actions, such as retrying or starting over. */
  actions?: ReactNode
}

/**
 * Why a job failed, and what the user can do next.
 *
 * The service's own reason is shown when there is one; the fallback still
 * explains the situation rather than saying something went wrong.
 */
export function JobError({ reason, actions }: JobErrorProps) {
  return (
    <ErrorAlert
      title="Processing failed"
      message={
        reason ??
        'The service could not process this image and did not say why. Submitting it again may succeed.'
      }
      action={actions}
    />
  )
}
