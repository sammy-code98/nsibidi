import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { JobDetailsPage } from '@/pages/JobDetailsPage'
import { JobsPage } from '@/pages/JobsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UploadPage } from '@/pages/UploadPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <UploadPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:jobId', element: <JobDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
