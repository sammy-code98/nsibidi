import { Card, Link } from '@heroui/react'
import { LinkButton } from '@/components/ui/LinkButton'
import { useJobStatus } from '@/features/jobs/hooks/useJobStatus'
import { getJobStatusPresentation } from '@/features/jobs/job.status'
import type { TrackedJob } from '@/features/jobs/job.types'
import { ROUTES } from '@/lib/constants'
import { JobProgress } from './JobProgress'
import { JobStatus } from './JobStatus'

interface JobCardProps {
  job: TrackedJob
}

/**
 * One job in the list, with its own status subscription.
 *
 * Each card reads its own job, so jobs update independently — one can be
 * processing while another has already completed or failed.
 */
export function JobCard({ job }: JobCardProps) {
  const { status, job: apiJob, isPending, isError } = useJobStatus(job.id)
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
            <p className="text-sm text-muted">
              {isError ? 'Status unavailable' : 'Checking status…'}
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

        {status === 'failed' && apiJob?.error ? (
          <p className="text-sm text-danger">{apiJob.error}</p>
        ) : null}

        {status === 'complete' ? (
          <div className="flex justify-end">
            <LinkButton href={detailsHref} size="sm">
              View result
            </LinkButton>
          </div>
        ) : null}

        {isPending && !status ? (
          <span className="sr-only">Loading job status</span>
        ) : null}
      </Card.Content>
    </Card>
  )
}
