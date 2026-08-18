import { JobList } from '@/components/jobs/JobList'
import { PageHeading } from '@/components/layout/PageHeading'
import { UploadIcon } from '@/components/upload/UploadIcon'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import { ROUTES } from '@/lib/constants'

export function JobsPage() {
  const { jobs } = useJobsRegistry()

  return (
    <>
      <PageHeading
        title="Jobs"
        description="Track every image you have submitted for processing."
        action={
          jobs.length > 0 ? (
            <LinkButton href={ROUTES.upload} size="sm">
              Upload an image
            </LinkButton>
          ) : null
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<UploadIcon className="size-5" />}
          title="No jobs yet"
          description="Upload an image to create your first processing job. Jobs you submit appear here and update on their own."
          action={
            <LinkButton href={ROUTES.upload}>Upload an image</LinkButton>
          }
        />
      ) : (
        <JobList jobs={jobs} />
      )}
    </>
  )
}
