import { Card } from '@heroui/react'
import { PageHeading } from '@/components/layout/PageHeading'
import { JobList } from '@/components/jobs/JobList'
import { useJobsRegistry } from '@/features/jobs/jobsContext'

export function JobsPage() {
  const { jobs } = useJobsRegistry()

  return (
    <>
      <PageHeading
        title="Jobs"
        description="Track every image you have submitted for processing."
      />

      {jobs.length === 0 ? (
        <Card>
          <Card.Content className="py-10 text-center text-sm text-muted">
            You have not submitted any images yet.
          </Card.Content>
        </Card>
      ) : (
        <JobList jobs={jobs} />
      )}
    </>
  )
}
