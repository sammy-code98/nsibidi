import type { JobStatus } from './job.types'

/** Colour token used to present a status, matching HeroUI's chip colours. */
type StatusTone = 'default' | 'accent' | 'success' | 'danger'

interface JobStatusPresentation {
  /** Short human-readable status, shown in place of the raw API value. */
  label: string
  /** Sentence explaining what the status means for the user. */
  description: string
  tone: StatusTone
}

/**
 * The single source of truth for how each status is presented.
 *
 * Raw API values (`queued`, `processing`, …) are never rendered directly;
 * every component reads its copy from here so wording stays consistent.
 */
export const jobStatusConfig: Record<JobStatus, JobStatusPresentation> = {
  queued: {
    label: 'Queued',
    description: 'Your job is waiting to be processed.',
    tone: 'default',
  },
  processing: {
    label: 'Processing',
    description: 'Your image is currently being processed.',
    tone: 'accent',
  },
  complete: {
    label: 'Complete',
    description: 'Your image has finished processing.',
    tone: 'success',
  },
  failed: {
    label: 'Failed',
    description: 'We could not process your image.',
    tone: 'danger',
  },
}

export function getJobStatusPresentation(
  status: JobStatus,
): JobStatusPresentation {
  return jobStatusConfig[status]
}
