import { Card } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { JobStatus } from '@/components/jobs/JobStatus'
import { PageHeading } from '@/components/layout/PageHeading'
import { ResultCard } from '@/components/results/ResultCard'
import { LinkButton } from '@/components/ui/LinkButton'
import { useJobStatus } from '@/features/jobs/hooks/useJobStatus'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import { ROUTES } from '@/lib/constants'

export function JobDetailsPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()
  const { getJob } = useJobsRegistry()
  const trackedJob = getJob(jobId)
  const { status } = useJobStatus(jobId)

  return (
    <>
      <PageHeading
        title={trackedJob?.filename ?? 'Job details'}
        action={
          <LinkButton href={ROUTES.jobs} variant="secondary" size="sm">
            Back to jobs
          </LinkButton>
        }
      />

      {status ? (
        <div className="space-y-4">
          <Card>
            <Card.Content className="py-4">
              <JobStatus status={status} withDescription />
            </Card.Content>
          </Card>

          {status === 'complete' ? (
            <ResultCard jobId={jobId} isComplete />
          ) : null}
        </div>
      ) : (
        <Card>
          <Card.Content className="py-10 text-center text-sm text-muted">
            Loading this job…
          </Card.Content>
        </Card>
      )}
    </>
  )
}
