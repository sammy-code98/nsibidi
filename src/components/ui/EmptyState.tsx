import { Card } from '@heroui/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}


export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <Card.Content className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        {icon ? (
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-surface-secondary text-muted"
          >
            {icon}
          </span>
        ) : null}

        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">{title}</p>
          <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
        </div>

        {action ? <div className="mt-1">{action}</div> : null}
      </Card.Content>
    </Card>
  )
}
