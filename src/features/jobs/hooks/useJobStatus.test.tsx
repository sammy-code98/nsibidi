// import { screen, waitFor } from '@testing-library/react'
// import { afterEach, describe, expect, it } from 'vitest'
// import { jobsApi } from '@/api/jobs'
// import { JobCard } from '@/components/jobs/JobCard'
// import { server } from '@/mocks/server'
// import { imageFile, renderWithProviders, createFakeClock } from '@/test/utils'
// import type { TrackedJob } from '../job.types'

// const clock = createFakeClock()
// afterEach(() => clock.reset())

// const trackedJob = (id: string, filename: string): TrackedJob => ({
//   id,
//   filename,
//   file: imageFile(filename),
//   createdAt: new Date().toISOString(),
// })

// /** Counts status requests, so "polling stopped" can be asserted, not assumed. */
// function countStatusRequests(jobId: string) {
//   let count = 0
//   const listener = ({ request }: { request: Request }) => {
//     const { pathname } = new URL(request.url)
//     if (request.method === 'GET' && pathname === `/jobs/${jobId}`) count += 1
//   }
//   server.events.on('request:start', listener)
//   return {
//     get value() {
//       return count
//     },
//     stop: () => server.events.removeListener('request:start', listener),
//   }
// }

// const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// describe('useJobStatus polling', () => {
//   it('updates a job through to completion without any user action', async () => {
//     const created = await jobsApi.create(imageFile('success-live.png'))
//     renderWithProviders(
//       <JobCard job={trackedJob(created.job_id, 'success-live.png')} />,
//     )

//     await screen.findByText('Queued')

//     clock.advance(4_500)
//     expect(await screen.findByText('Processing', {}, { timeout: 10_000 })).toBeDefined()

//     clock.advance(60_000)
//     expect(await screen.findByText('Complete', {}, { timeout: 10_000 })).toBeDefined()
//   })

//   it('stops polling once a job completes', async () => {
//     const created = await jobsApi.create(imageFile('success-stop.png'))
//     const requests = countStatusRequests(created.job_id)

//     renderWithProviders(
//       <JobCard job={trackedJob(created.job_id, 'success-stop.png')} />,
//     )

//     clock.advance(60_000)
//     await screen.findByText('Complete', {}, { timeout: 10_000 })

//     const atCompletion = requests.value
//     await wait(6_000)

//     expect(requests.value).toBe(atCompletion)
//     requests.stop()
//   })

//   it('stops polling once a job fails', async () => {
//     const created = await jobsApi.create(imageFile('broken-stop.png'))
//     const requests = countStatusRequests(created.job_id)

//     renderWithProviders(
//       <JobCard job={trackedJob(created.job_id, 'broken-stop.png')} />,
//     )

//     clock.advance(60_000)
//     await screen.findByText('Failed', {}, { timeout: 10_000 })

//     const atFailure = requests.value
//     await wait(6_000)

//     expect(requests.value).toBe(atFailure)
//     requests.stop()
//   })

//   it('stops polling when the job is no longer displayed', async () => {
//     const created = await jobsApi.create(imageFile('slow-unmount.png'))
//     const requests = countStatusRequests(created.job_id)

//     const { unmount } = renderWithProviders(
//       <JobCard job={trackedJob(created.job_id, 'slow-unmount.png')} />,
//     )

//     await screen.findByText('Queued')
//     await waitFor(() => expect(requests.value).toBeGreaterThanOrEqual(1))

//     unmount()
//     const atUnmount = requests.value
//     await wait(6_000)

//     expect(requests.value).toBe(atUnmount)
//     requests.stop()
//   })

//   it('gives up rather than polling a job the service cannot describe', async () => {
//     const requests = countStatusRequests('job_unknown')

//     renderWithProviders(<JobCard job={trackedJob('job_unknown', 'ghost.png')} />)

//     await screen.findByText(/no longer available/i, {}, { timeout: 10_000 })
//     await wait(6_000)

//     expect(requests.value).toBeLessThanOrEqual(3)
//     requests.stop()
//   })
// })




import { screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { jobsApi } from '@/api/jobs'
import { JobCard } from '@/components/jobs/JobCard'
import { server } from '@/mocks/server'
import { imageFile, renderWithProviders, createFakeClock } from '@/test/utils'
import type { TrackedJob } from '../job.types'

const clock = createFakeClock()
afterEach(() => clock.reset())
afterAll(() => clock.restore())

const trackedJob = (id: string, filename: string): TrackedJob => ({
  id,
  filename,
  file: imageFile(filename),
  createdAt: new Date().toISOString(),
})

/** Counts status requests, so "polling stopped" can be asserted, not assumed. */
function countStatusRequests(jobId: string) {
  let count = 0
  const listener = ({ request }: { request: Request }) => {
    const { pathname } = new URL(request.url)
    if (request.method === 'GET' && pathname === `/jobs/${jobId}`) count += 1
  }
  server.events.on('request:start', listener)
  return {
    get value() {
      return count
    },
    stop: () => server.events.removeListener('request:start', listener),
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('useJobStatus polling', () => {
  it('updates a job through to completion without any user action', async () => {
    const created = await jobsApi.create(imageFile('success-live.png'))
    renderWithProviders(
      <JobCard job={trackedJob(created.job_id, 'success-live.png')} />,
    )

    await screen.findByText('Queued')

    clock.advance(4_500)
    expect(await screen.findByText('Processing', {}, { timeout: 10_000 })).toBeDefined()

    clock.advance(60_000)
    expect(await screen.findByText('Complete', {}, { timeout: 10_000 })).toBeDefined()
  })

  it('stops polling once a job completes', async () => {
    const created = await jobsApi.create(imageFile('success-stop.png'))
    const requests = countStatusRequests(created.job_id)

    renderWithProviders(
      <JobCard job={trackedJob(created.job_id, 'success-stop.png')} />,
    )

    clock.advance(60_000)
    await screen.findByText('Complete', {}, { timeout: 10_000 })

    const atCompletion = requests.value
    await wait(6_000)

    expect(requests.value).toBe(atCompletion)
    requests.stop()
  })

  it('stops polling once a job fails', async () => {
    const created = await jobsApi.create(imageFile('broken-stop.png'))
    const requests = countStatusRequests(created.job_id)

    renderWithProviders(
      <JobCard job={trackedJob(created.job_id, 'broken-stop.png')} />,
    )

    clock.advance(60_000)
    await screen.findByText('Failed', {}, { timeout: 10_000 })

    const atFailure = requests.value
    await wait(6_000)

    expect(requests.value).toBe(atFailure)
    requests.stop()
  })

  it('stops polling when the job is no longer displayed', async () => {
    const created = await jobsApi.create(imageFile('slow-unmount.png'))
    const requests = countStatusRequests(created.job_id)

    const { unmount } = renderWithProviders(
      <JobCard job={trackedJob(created.job_id, 'slow-unmount.png')} />,
    )

    await screen.findByText('Queued')
    await waitFor(() => expect(requests.value).toBeGreaterThanOrEqual(1))

    unmount()
    const atUnmount = requests.value
    await wait(6_000)

    expect(requests.value).toBe(atUnmount)
    requests.stop()
  })

  it('gives up rather than polling a job the service cannot describe', async () => {
    const requests = countStatusRequests('job_unknown')

    renderWithProviders(<JobCard job={trackedJob('job_unknown', 'ghost.png')} />)

    await screen.findByText(/no longer available/i, {}, { timeout: 10_000 })
    await wait(6_000)

    expect(requests.value).toBeLessThanOrEqual(3)
    requests.stop()
  })
})