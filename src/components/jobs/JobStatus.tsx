import { Chip } from '@heroui/react'
import type { JobStatus as JobStatusValue } from '@/features/jobs/job.types'
import { jobStatusConfig } from '@/features/jobs/job.status'

interface JobStatusProps {
  status: JobStatusValue
  /** Also render the explanatory sentence beneath the label. */
  withDescription?: boolean
}

/**
 * Presents a job's status in human terms.
 *
 * Always renders the status as text, never as colour alone, so the state is
 * legible without relying on colour perception. Marked as a polite live region
 * so a screen reader user hears a job settle without re-reading the page —
 * `role="status"` announces changes only, so the initial render is silent.
 */
export function JobStatus({ status, withDescription }: JobStatusProps) {
  const { label, description, tone } = jobStatusConfig[status]

  return (
    <div className="space-y-1" role="status">
      <Chip color={tone} variant="soft" size="sm">
        {label}
      </Chip>
      {withDescription ? (
        <p className="text-sm text-muted">{description}</p>
      ) : null}
    </div>
  )
}
