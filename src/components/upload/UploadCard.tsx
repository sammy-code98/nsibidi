import { Alert, Button, Card, Spinner } from '@heroui/react'
import { useCallback, useState } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { useCreateJob } from '@/features/jobs/hooks/useCreateJob'
import type { CreateJobResponse } from '@/features/jobs/job.types'
import { useFileSelection } from '@/features/upload/useFileSelection'
import { FileDropzone } from './FileDropzone'
import { FilePreview } from './FilePreview'

/**
 * Staging area for a single image: pick a file, review it, and submit it as a
 * processing job.
 */
export function UploadCard() {
  const { file, error: validationError, selectFile, clearSelection } =
    useFileSelection()
  const [acceptedJob, setAcceptedJob] = useState<CreateJobResponse | null>(null)

  const handleSuccess = useCallback(
    (job: CreateJobResponse) => {
      setAcceptedJob(job)
      clearSelection()
    },
    [clearSelection],
  )

  const {
    submit,
    isSubmitting,
    error: submissionError,
    reset: resetSubmission,
  } = useCreateJob({ onSuccess: handleSuccess })

  const handleSelectFile = useCallback(
    (candidate: File) => {
      // A new choice supersedes whatever the last attempt reported.
      setAcceptedJob(null)
      resetSubmission()
      selectFile(candidate)
    },
    [resetSubmission, selectFile],
  )

  const handleSubmit = () => {
    if (file) {
      submit(file)
    }
  }

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
          <FilePreview
            file={file}
            onRemove={clearSelection}
            isRemoveDisabled={isSubmitting}
          />
        ) : (
          <FileDropzone
            onFileSelected={handleSelectFile}
            isDisabled={isSubmitting}
          />
        )}

        {validationError ? (
          <ErrorAlert
            title={validationError.title}
            message={validationError.message}
          />
        ) : null}

        {submissionError ? (
          <ErrorAlert
            title={submissionError.title}
            message={submissionError.message}
            action={
              <Button
                variant="secondary"
                size="sm"
                onPress={handleSubmit}
                isDisabled={!file || isSubmitting}
              >
                Try again
              </Button>
            }
          />
        ) : null}

        {acceptedJob ? (
          <Alert status="success" role="status">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Your image has been queued</Alert.Title>
              <Alert.Description>
                Job {acceptedJob.job_id} is waiting to be processed.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>

      <Card.Footer className="justify-end">
        <Button
          variant="primary"
          onPress={handleSubmit}
          isDisabled={!file}
          isPending={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            'Submit for processing'
          )}
        </Button>
      </Card.Footer>
    </Card>
  )
}
