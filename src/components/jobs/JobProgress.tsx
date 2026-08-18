import { ProgressBar } from '@heroui/react'

interface JobProgressProps {
  /** Describes what is in progress, for assistive technology. */
  label: string
}

/**
 * Activity indicator for a job that is still running.
 *
 * Deliberately indeterminate: the service reports a status, not a percentage,
 * so showing a filling bar would invent progress the app cannot actually know.
 */
export function JobProgress({ label }: JobProgressProps) {
  return (
    <ProgressBar isIndeterminate aria-label={label} size="sm">
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  )
}
