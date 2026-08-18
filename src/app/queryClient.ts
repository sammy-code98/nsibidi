import { QueryClient } from '@tanstack/react-query'

/**
 * Shared query client.
 *
 * Job status is time-sensitive, so nothing is treated as fresh: a polled query
 * always reflects what the service last reported. Refetch-on-focus is off
 * because polling already keeps active jobs current, and refetching every
 * tracked job whenever the tab regains focus would be noise.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
