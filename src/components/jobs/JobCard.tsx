import { Button, Card, Link } from '@heroui/react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LinkButton } from '@/components/ui/LinkButton'
import { useIsJobLongRunning } from '@/features/jobs/hooks/useIsJobLongRunning'
import { useJobStatus } from '@/features/jobs/hooks/useJobStatus'
import { jobStatusConfig } from '@/features/jobs/job.status'
import type { TrackedJob } from '@/features/jobs/job.types'
import { isActiveStatus } from '@/features/jobs/job.utils'
import { ROUTES } from '@/lib/constants'
import { JobFailurePanel } from './JobFailurePanel'
import { JobLongRunningNotice } from './JobLongRunningNotice'
import { JobProgress } from './JobProgress'
import { JobStatus } from './JobStatus'

interface JobCardProps {
  job: TrackedJob
}


export function JobCard({ job }: JobCardProps) {
  const {
    status,
    job: apiJob,
    isPending,
    error: statusError,
    refetch,
  } = useJobStatus(job.id)

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
              className="block truncate py-1 text-sm font-medium"
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
            {jobStatusConfig[status].description}
          </p>
        ) : null}

        {status === 'processing' ? (
          <JobProgress label={`Processing ${job.filename}`} />
        ) : null}

        {isLongRunning ? <JobLongRunningNotice /> : null}

        {status === 'failed' ? (
          <JobFailurePanel job={job} reason={apiJob?.error} />
        ) : null}


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
