import { Alert } from '@heroui/react'
import type { ReactNode } from 'react'

interface ErrorAlertProps {
  /** Short headline naming what went wrong. */
  title: string
  /** Sentence explaining the cause and what to do next. */
  message: string
  /** Optional recovery actions, such as a retry button. */
  action?: ReactNode
}

/**
 * Standard presentation for a failure the user needs to act on.
 *
 * Uses `role="alert"` so the message is announced when it appears rather than
 * only being visible.
 */
export function ErrorAlert({ title, message, action }: ErrorAlertProps) {
  return (
    <Alert status="danger" role="alert">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
        {action ? <div className="mt-3 flex gap-2">{action}</div> : null}
      </Alert.Content>
    </Alert>
  )
}
