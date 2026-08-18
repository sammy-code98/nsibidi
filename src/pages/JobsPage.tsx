import { Card } from '@heroui/react'
import { PageHeading } from '@/components/layout/PageHeading'

export function JobsPage() {
  return (
    <>
      <PageHeading
        title="Jobs"
        description="Track every image you have submitted for processing."
      />

      <Card>
        <Card.Content className="py-10 text-center text-sm text-muted">
          Job tracking is added in a later step.
        </Card.Content>
      </Card>
    </>
  )
}
