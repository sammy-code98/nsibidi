import { RouterProvider as AriaRouterProvider } from '@heroui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import { AppHeader } from './AppHeader'


export function AppLayout() {
  const navigate = useNavigate()
  const { jobs } = useJobsRegistry()

  return (
    <AriaRouterProvider navigate={(path) => void navigate(path)}>
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader jobCount={jobs.length} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <Outlet />
        </main>
      </div>
    </AriaRouterProvider>
  )
}
