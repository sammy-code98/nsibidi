import { Button } from '@heroui/react'
import type { ReactNode } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { useRetryJob } from '@/features/jobs/hooks/useRetryJob'
import type { CreateJobResponse, TrackedJob } from '@/features/jobs/job.types'
import { canRetryJob } from '@/features/jobs/job.utils'
import { JobError } from './JobError'

interface JobFailurePanelProps {
  /**
   * The failed job. Retrying is only offered when the job is being tracked
   * and its file is still held — a job opened by URL has nothing to resend.
   */
  job?: TrackedJob
  /** The reason the service gave, if it gave one. */
  reason?: string | null
  /** Called with the replacement job once the resubmission is accepted. */
  onRetried?: (created: CreateJobResponse) => void
  /** Extra recovery actions shown beside the retry button. */
  extraActions?: ReactNode
}

/**
 * Everything shown when a job has failed: the reason, the recovery actions,
 * and any error from the resubmission itself.
 *
 * Both the job list and the details screen show exactly this, so it lives in
 * one place. Keeping the retry mutation in here also means it is only created
 * for jobs that have actually failed.
 */
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
