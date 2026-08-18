import { Button, Card } from '@heroui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { JobFailurePanel } from '@/components/jobs/JobFailurePanel'
import { JobLongRunningNotice } from '@/components/jobs/JobLongRunningNotice'
import { JobProgress } from '@/components/jobs/JobProgress'
import { JobStatus } from '@/components/jobs/JobStatus'
import { PageHeading } from '@/components/layout/PageHeading'
import { ResultCard } from '@/components/results/ResultCard'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { LinkButton } from '@/components/ui/LinkButton'
import { useIsJobLongRunning } from '@/features/jobs/hooks/useIsJobLongRunning'
import { useJobStatus } from '@/features/jobs/hooks/useJobStatus'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import { isActiveStatus } from '@/features/jobs/job.utils'
import { ROUTES } from '@/lib/constants'


export function JobDetailsPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { getJob } = useJobsRegistry()
  const trackedJob = getJob(jobId)

  const {
    status,
    job,
    isPending,
    error: statusError,
    refetch,
  } = useJobStatus(jobId)

  const isLongRunning = useIsJobLongRunning(
    trackedJob?.createdAt,
    status !== undefined && isActiveStatus(status),
  )

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
        <JobFailurePanel
          job={trackedJob}
          reason={job?.error}
          // Follow the replacement, so the user watches the attempt that is
          // actually running now.
          onRetried={(created) =>
            void navigate(ROUTES.jobDetails(created.job_id))
          }
          extraActions={
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
          {isLongRunning ? <JobLongRunningNotice /> : null}
        </Card.Content>
      </Card>
    </>
  )
}
