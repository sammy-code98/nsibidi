import { Card } from '@heroui/react'
import { PageHeading } from '@/components/layout/PageHeading'
import { APP_TAGLINE } from '@/lib/constants'

export function UploadPage() {
  return (
    <>
      <PageHeading title="Async image processing" description={APP_TAGLINE} />

      <Card>
        <Card.Header>
          <Card.Title>Upload an image</Card.Title>
          <Card.Description>
            Choose an image to submit for processing. You can keep using the app
            while it runs.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            The upload area is added in the next step.
          </div>
        </Card.Content>
      </Card>
    </>
  )
}
