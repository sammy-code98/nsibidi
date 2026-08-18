import { Card } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { PageHeading } from '@/components/layout/PageHeading'

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>()

  return (
    <>
      <PageHeading title="Job details" description={`Job ${jobId ?? ''}`} />

      <Card>
        <Card.Content className="py-10 text-center text-sm text-muted">
          Job details are added in a later step.
        </Card.Content>
      </Card>
    </>
  )
}
