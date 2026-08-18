import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { JobsProvider } from '@/features/jobs/JobsProvider'
import { queryClient } from './queryClient'
import { router } from './routes'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JobsProvider>
        <RouterProvider router={router} />
      </JobsProvider>
    </QueryClientProvider>
  )
}
