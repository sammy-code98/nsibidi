import { Alert } from '@heroui/react'


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
