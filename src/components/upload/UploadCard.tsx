import { Button, Card, Spinner } from '@heroui/react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { useCreateJob } from '@/features/jobs/hooks/useCreateJob'
import type { CreateJobResponse } from '@/features/jobs/job.types'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import { useFileSelection } from '@/features/upload/useFileSelection'
import { ROUTES } from '@/lib/constants'
import { FileDropzone } from './FileDropzone'
import { FilePreview } from './FilePreview'

/**
 * Staging area for a single image: pick a file, review it, and submit it as a
 * processing job.
 */
export function UploadCard() {
  const navigate = useNavigate()
  const { trackJob } = useJobsRegistry()
  const {
    file,
    error: validationError,
    selectFile,
    clearSelection,
  } = useFileSelection()

  const handleAccepted = useCallback(
    (job: CreateJobResponse, submittedFile: File) => {
      trackJob({
        id: job.job_id,
        filename: submittedFile.name,
        // Kept so a failed job can be resubmitted without re-picking the file.
        file: submittedFile,
        createdAt: new Date().toISOString(),
      })

      clearSelection()
      void navigate(ROUTES.jobs)
    },
    [clearSelection, navigate, trackJob],
  )

  const {
    submit,
    isSubmitting,
    error: submissionError,
    reset: resetSubmission,
  } = useCreateJob({ onSuccess: handleAccepted })

  const handleSelectFile = useCallback(
    (candidate: File) => {
      // A new choice supersedes whatever the last attempt reported.
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
