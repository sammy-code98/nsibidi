import { Card } from '@heroui/react'
import { useFileSelection } from '@/features/upload/useFileSelection'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { FileDropzone } from './FileDropzone'
import { FilePreview } from './FilePreview'

/**
 * Staging area for a single image: pick a file, see it validated, preview it,
 * or remove it and start over.
 */
export function UploadCard() {
  const { file, error, selectFile, clearSelection } = useFileSelection()

  return (
    <Card>
      <Card.Header>
        <Card.Title>Upload an image</Card.Title>
        <Card.Description>
          Choose an image to submit for processing. You can keep using the app
          while it runs.
        </Card.Description>
      </Card.Header>

      <Card.Content className="space-y-4">
        {file ? (
          <FilePreview file={file} onRemove={clearSelection} />
        ) : (
          <FileDropzone onFileSelected={selectFile} />
        )}

        {error ? (
          <ErrorAlert title={error.title} message={error.message} />
        ) : null}
      </Card.Content>
    </Card>
  )
}
