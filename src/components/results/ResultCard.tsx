import { Button, Card, Spinner } from '@heroui/react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { useJobResult } from '@/features/jobs/hooks/useJobResult'
import { ResultViewer } from './ResultViewer'

interface ResultCardProps {
  jobId: string
  /** Whether the job has finished. The result is requested only when true. */
  isComplete: boolean
}

/**
 * The result of a completed job, covering loading, failure and success.
 *
 * Failing to load a result is treated as its own problem with its own retry,
 * rather than being reported as the job having failed.
 */
export function ResultCard({ jobId, isComplete }: ResultCardProps) {
  const { result, isLoading, error, retry } = useJobResult(jobId, {
    enabled: isComplete,
  })

  // Asking for a result before the job has finished is a normal thing for a
  // user to do — by bookmarking the page, say — so say so plainly rather than
  // claiming the job is complete.
  if (!isComplete) {
    return (
      <EmptyState
        title="This result isn't ready yet"
        description="Your image is still being processed. This page updates on its own, so there is no need to refresh."
      />
    )
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Processing complete</Card.Title>
        <Card.Description>
          Your image has been successfully processed.
        </Card.Description>
      </Card.Header>

      <Card.Content>
        {isLoading ? (
          <div
            className="flex items-center gap-3 py-8 text-sm text-muted"
            role="status"
          >
            <Spinner size="sm" aria-hidden="true" />
            <span>Loading your result…</span>
          </div>
        ) : null}

        {error ? (
          <ErrorAlert
            title={error.title}
            message={error.message}
            action={
              <Button variant="secondary" size="sm" onPress={retry}>
                Try again
              </Button>
            }
          />
        ) : null}

        {result ? <ResultViewer result={result} /> : null}
      </Card.Content>
    </Card>
  )
}
