import { Button } from '@heroui/react'
import type { ReactNode } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { useRetryJob } from '@/features/jobs/hooks/useRetryJob'
import type { CreateJobResponse, TrackedJob } from '@/features/jobs/job.types'
import { canRetryJob } from '@/features/jobs/job.utils'
import { JobError } from './JobError'

interface JobFailurePanelProps {
  job?: TrackedJob
  reason?: string | null
  onRetried?: (created: CreateJobResponse) => void
  extraActions?: ReactNode
}


export function JobFailurePanel({
  job,
  reason,
  onRetried,
  extraActions,
}: JobFailurePanelProps) {
  const { retry, isRetrying, error } = useRetryJob({ onRetried })

  return (
    <div className="space-y-3">
      <JobError
        reason={reason}
        actions={
          <>
            {job && canRetryJob(job) ? (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => retry(job)}
                isPending={isRetrying}
              >
                {isRetrying ? 'Resubmitting…' : 'Retry job'}
              </Button>
            ) : null}
            {extraActions}
          </>
        }
      />

      {error ? <ErrorAlert title={error.title} message={error.message} /> : null}
    </div>
  )
}
