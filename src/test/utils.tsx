import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { JobsProvider } from '@/features/jobs/JobsProvider'
import { useJobsRegistry } from '@/features/jobs/jobsContext'
import type { TrackedJob } from '@/features/jobs/job.types'

/** A tiny valid PNG, so files behave like real images. */
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
  0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
])

/*** Builds an image file for tests. */
export function imageFile(
  name = 'photo.png',
  { type = 'image/png', size }: { type?: string; size?: number } = {},
): File {
  const bytes = size === undefined ? PNG_BYTES : new Uint8Array(size)
  return new File([bytes], name, { type })
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface RenderOptions {
  queryClient?: QueryClient
  route?: string
  /** Jobs already being tracked when the component mounts. */
  seedJobs?: TrackedJob[]
}

/** Puts jobs into the registry the way a submission would. */
function SeedJobs({ jobs }: { jobs: TrackedJob[] }) {
  const { trackJob } = useJobsRegistry()
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    jobs.forEach(trackJob)
  }, [jobs, trackJob])

  return null
}

/** Renders a component inside the providers the app supplies at runtime. */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    route = '/',
    seedJobs = [],
  }: RenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <JobsProvider>
          <SeedJobs jobs={seedJobs} />
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </JobsProvider>
      </QueryClientProvider>
    )
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper }) }
}


/**
 * Freezes Date.now so job status (derived from elapsed time) only moves when
 * the test calls advance(). An offset on a still-ticking clock is not enough:
 * long findByText waits on CI can skip intermediate statuses.
 */
export function createFakeClock() {
  const realNow = Date.now.bind(Date)
  let now = realNow()

  Date.now = () => now

  return {
    advance: (ms: number) => {
      now += ms
    },
    reset: () => {
      now = realNow()
    },
    restore: () => {
      Date.now = realNow
    },
  }
}