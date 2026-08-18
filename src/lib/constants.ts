export const APP_NAME = "Nsibidi";

export const APP_TAGLINE = "Async image processing made simple.";

export const ROUTES = {
  upload: "/",
  jobs: "/jobs",
  jobDetails: (jobId: string) => `/jobs/${jobId}`,
} as const;
