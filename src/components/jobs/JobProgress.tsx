import { ProgressBar } from '@heroui/react'

interface JobProgressProps {
  label: string
}


export function JobProgress({ label }: JobProgressProps) {
  return (
    <ProgressBar isIndeterminate aria-label={label} size="sm">
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  )
}
