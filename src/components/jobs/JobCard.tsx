import { Button, Card, Link } from '@heroui/react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LinkButton } from '@/components/ui/LinkButton'
import { useIsJobLongRunning } from '@/features/jobs/hooks/useIsJobLongRunning'
import { useJobStatus } from '@/features/jobs/hooks/useJobStatus'
import { useRetryJob } from '@/features/jobs/hooks/useRetryJob'
import { getJobStatusPresentation } from '@/features/jobs/job.status'
import type { TrackedJob } from '@/features/jobs/job.types'
import { canRetryJob, isActiveStatus } from '@/features/jobs/job.utils'
import { ROUTES } from '@/lib/constants'
import { JobError } from './JobError'
import { JobLongRunningNotice } from './JobLongRunningNotice'
import { JobProgress } from './JobProgress'
import { JobStatus } from './JobStatus'

interface JobCardProps {
  job: TrackedJob
}

/**
 * One job in the list, with its own status subscription.
 *
 * Each card reads its own job, so jobs update independently — one can be
 * processing while another has already completed or failed, and a card whose
 * status check breaks does not disturb the others.
 */
export function JobCard({ job }: JobCardProps) {
  const {
    status,
    job: apiJob,
    isPending,
    error: statusError,
    refetch,
  } = useJobStatus(job.id)
  const { retry, isRetrying, error: retryError } = useRetryJob()
  const isLongRunning = useIsJobLongRunning(
    job.createdAt,
    status !== undefined && isActiveStatus(status),
  )
  const detailsHref = ROUTES.jobDetails(job.id)

  return (
    <Card>
      <Card.Content className="space-y-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={detailsHref}
              className="block truncate text-sm font-medium"
            >
              {job.filename}
            </Link>
          </div>

          {status ? (
            <JobStatus status={status} />
          ) : (
            <p className="text-sm text-muted" role="status">
              {isPending ? 'Checking status…' : 'Status unavailable'}
            </p>
          )}
        </div>

        {status ? (
          <p className="text-sm text-muted">
            {getJobStatusPresentation(status).description}
          </p>
        ) : null}

        {status === 'processing' ? (
          <JobProgress label={`Processing ${job.filename}`} />
        ) : null}

        {isLongRunning ? <JobLongRunningNotice /> : null}

        {status === 'failed' ? (
          <JobError
            reason={apiJob?.error}
            actions={
              canRetryJob(job) ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => retry(job)}
                  isPending={isRetrying}
                >
                  {isRetrying ? 'Resubmitting…' : 'Retry job'}
                </Button>
              ) : null
            }
          />
        ) : null}

        {retryError ? (
          <ErrorAlert title={retryError.title} message={retryError.message} />
        ) : null}

        {/*
          The status check itself failed, which stops polling. Without an
          explicit way back the job would sit unreadable forever, so offer one.
        */}
        {statusError && !status ? (
          <ErrorAlert
            title={statusError.title}
            message={statusError.message}
            action={
              <Button variant="secondary" size="sm" onPress={refetch}>
                Check again
              </Button>
            }
          />
        ) : null}

        {status === 'complete' ? (
          <div className="flex justify-end">
            <LinkButton href={detailsHref} size="sm">
              View result
            </LinkButton>
          </div>
        ) : null}

      </Card.Content>
    </Card>
  )
}
