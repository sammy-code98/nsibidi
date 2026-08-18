import { Card } from '@heroui/react'
import { PageHeading } from '@/components/layout/PageHeading'
import { jobStatusConfig } from '@/features/jobs/job.status'
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
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Card>
                <Card.Content className="flex items-center justify-between gap-4 py-4">
                  <span className="min-w-0 truncate text-sm font-medium">
                    {job.filename}
                  </span>
                  <span className="shrink-0 text-sm text-muted">
                    {jobStatusConfig.queued.label}
                  </span>
                </Card.Content>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
