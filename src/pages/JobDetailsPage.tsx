import { Card } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { JobError } from '@/components/jobs/JobError'
import { JobProgress } from '@/components/jobs/JobProgress'
import { JobStatus } from '@/components/jobs/JobStatus'
import { PageHeading } from '@/components/layout/PageHeading'
import { ResultCard } from '@/components/results/ResultCard'
import { LinkButton } from '@/components/ui/LinkButton'
import { useJobStatus } from '@/features/jobs/hooks/useJobStatus'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import { ROUTES } from '@/lib/constants'

/**
 * A single job in detail.
 *
 * Composes the same status, progress and result components the job list uses,
 * so there is one implementation of each state rather than a second copy here.
 */
export function JobDetailsPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const { getJob } = useJobsRegistry()
  const trackedJob = getJob(jobId)
  const { status, job, isPending, isError } = useJobStatus(jobId)

  const heading = (
    <PageHeading
      title={trackedJob?.filename ?? 'Job details'}
      action={
        <LinkButton href={ROUTES.jobs} variant="secondary" size="sm">
          Back to jobs
        </LinkButton>
      }
    />
  )

  if (isPending) {
    return (
      <>
        {heading}
        <Card>
          <Card.Content className="py-10 text-center text-sm text-muted">
            <span role="status">Loading this job…</span>
          </Card.Content>
        </Card>
      </>
    )
  }

  if (isError || !status) {
    return (
      <>
        {heading}
        <Card>
          <Card.Header>
            <Card.Title>We can&apos;t find that job</Card.Title>
            <Card.Description>
              Jobs are only tracked for the current session, so this one may
              have been lost on a page reload. Upload the image again to create
              a new job.
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <LinkButton href={ROUTES.upload}>Upload an image</LinkButton>
          </Card.Footer>
        </Card>
      </>
    )
  }

  if (status === 'complete') {
    return (
      <>
        {heading}
        <ResultCard jobId={jobId} isComplete />
      </>
    )
  }

  if (status === 'failed') {
    return (
      <>
        {heading}
        <JobError
          reason={job?.error}
          actions={
            <LinkButton href={ROUTES.upload} variant="secondary" size="sm">
              Upload another image
            </LinkButton>
          }
        />
      </>
    )
  }

  return (
    <>
      {heading}
      <Card>
        <Card.Content className="space-y-4 py-6">
          <JobStatus status={status} withDescription />
          {status === 'processing' ? (
            <JobProgress
              label={`Processing ${trackedJob?.filename ?? 'your image'}`}
            />
          ) : null}
        </Card.Content>
      </Card>
    </>
  )
}
