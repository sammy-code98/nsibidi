import { Alert } from '@heroui/react'
import type { ReactNode } from 'react'

interface ErrorAlertProps {
  title: string
  message: string
  action?: ReactNode
}


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
