import { Chip } from '@heroui/react'
import type { JobStatus as JobStatusValue } from '@/features/jobs/job.types'
import { jobStatusConfig } from '@/features/jobs/job.status'

interface JobStatusProps {
  status: JobStatusValue
  withDescription?: boolean
}


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
