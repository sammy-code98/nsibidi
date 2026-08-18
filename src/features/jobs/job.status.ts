import type { JobStatus } from './job.types'

/** Colour token used to present a status, matching HeroUI's chip colours. */
type StatusTone = 'default' | 'accent' | 'success' | 'danger'

interface JobStatusPresentation {
  label: string;
  description: string;
  tone: StatusTone;
}


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
