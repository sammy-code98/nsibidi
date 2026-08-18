/** Display name of the application, used in the header and document titles. */
export const APP_NAME = 'Nsibidi'

/** One-line description shown in the page hero. */
export const APP_TAGLINE = 'Async image processing made simple.'

/** Application route paths, kept in one place so links never drift from routes. */
export const ROUTES = {
  upload: '/',
  jobs: '/jobs',
  jobDetails: (jobId: string) => `/jobs/${jobId}`,
} as const
