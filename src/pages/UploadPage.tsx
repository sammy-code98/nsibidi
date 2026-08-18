import { PageHeading } from '@/components/layout/PageHeading'
import { UploadCard } from '@/components/upload/UploadCard'
import { APP_TAGLINE } from '@/lib/constants'

export function UploadPage() {
  return (
    <>
      <PageHeading title="Async image processing" description={APP_TAGLINE} />
      <UploadCard />
    </>
  )
}
