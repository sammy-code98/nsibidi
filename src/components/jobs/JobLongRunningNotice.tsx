import { Alert } from '@heroui/react'

/**
 * Reassurance for a job that is taking longer than usual.
 *
 * Deliberately neutral rather than a warning: nothing has gone wrong, the job
 * is still running, and it is still being monitored. Marking it as a problem
 * would be misleading.
 */
export function JobLongRunningNotice() {
  return (
    <Alert status="default" role="status">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Still processing</Alert.Title>
        <Alert.Description>
          This is taking longer than expected, but your job is still active and
          we are still checking on it.
        </Alert.Description>
      </Alert.Content>
    </Alert>
  )
}
