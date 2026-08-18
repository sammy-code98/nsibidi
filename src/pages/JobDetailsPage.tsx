import { Button, Card } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { JobError } from '@/components/jobs/JobError'
import { JobProgress } from '@/components/jobs/JobProgress'
import { JobStatus } from '@/components/jobs/JobStatus'
import { PageHeading } from '@/components/layout/PageHeading'
import { ResultCard } from '@/components/results/ResultCard'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
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
  const {
    status,
    job,
    isPending,
    error: statusError,
    refetch,
  } = useJobStatus(jobId)

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

  if (!status) {
    // `statusError` covers every known failure; this only guards the case
    // where a request succeeded but returned nothing usable.
    const failure = statusError ?? {
      title: "We couldn't load this job",
      message:
        'The service did not return a status for this job. Please try again.',
    }

    return (
      <>
        {heading}
        <ErrorAlert
          title={failure.title}
          message={failure.message}
          action={
            <>
              <Button variant="secondary" size="sm" onPress={refetch}>
                Check again
              </Button>
              <LinkButton href={ROUTES.upload} variant="secondary" size="sm">
                Upload an image
              </LinkButton>
            </>
          }
        />
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
