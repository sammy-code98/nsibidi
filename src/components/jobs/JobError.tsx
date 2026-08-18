import type { ReactNode } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'

interface JobErrorProps {
  reason?: string | null
  actions?: ReactNode
}


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
