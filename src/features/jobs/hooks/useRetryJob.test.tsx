import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { jobsApi } from '@/api/jobs'
import { JobsPage } from '@/pages/JobsPage'
import { imageFile, renderWithProviders, createFakeClock } from '@/test/utils'
import type { TrackedJob } from '../job.types'

const clock = createFakeClock()
afterEach(() => clock.reset())

const trackedJob = (id: string, filename: string): TrackedJob => ({
  id,
  filename,
  file: imageFile(filename),
  createdAt: new Date().toISOString(),
})

describe('retrying a failed job', () => {
  it('creates a new job and leaves the failed one intact', async () => {
    const original = await jobsApi.create(imageFile('broken-retry.png'))
    clock.advance(20_000)

    renderWithProviders(<JobsPage />, {
      seedJobs: [trackedJob(original.job_id, 'broken-retry.png')],
    })

    await screen.findByText('Processing failed', {}, { timeout: 10_000 })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: /retry job/i }))

    // A second job appears, and the failed one is still listed.
    await waitFor(
      () => expect(screen.getAllByRole('listitem')).toHaveLength(2),
      { timeout: 10_000 },
    )
    expect(screen.getByText('Processing failed')).toBeDefined()
    expect(screen.getAllByText('broken-retry.png')).toHaveLength(2)

    // The original really is untouched on the service.
    expect((await jobsApi.get(original.job_id)).status).toBe('failed')
  })

  it('starts the replacement job from scratch', async () => {
    const original = await jobsApi.create(imageFile('broken-fresh.png'))
    clock.advance(20_000)

    const { queryClient } = renderWithProviders(<JobsPage />, {
      seedJobs: [trackedJob(original.job_id, 'broken-fresh.png')],
    })

    await screen.findByText('Processing failed', {}, { timeout: 10_000 })
    await userEvent.click(screen.getByRole('button', { name: /retry job/i }))

    await waitFor(
      () => expect(screen.getAllByRole('listitem')).toHaveLength(2),
      { timeout: 10_000 },
    )

    const cachedIds = queryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey)
      .filter((key): key is [string, string] => key.length === 2)
      .map(([, id]) => id)

    const replacementId = cachedIds.find((id) => id !== original.job_id)
    expect(replacementId).toBeDefined()
    expect((await jobsApi.get(replacementId!)).status).toBe('queued')
  })

  it('offers no retry for a job whose file is not held', async () => {
    const original = await jobsApi.create(imageFile('broken-orphan.png'))
    clock.advance(20_000)

    renderWithProviders(<JobsPage />, {
      seedJobs: [
        {
          id: original.job_id,
          filename: 'broken-orphan.png',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    await screen.findByText('Processing failed', {}, { timeout: 10_000 })
    expect(screen.queryByRole('button', { name: /retry job/i })).toBeNull()
  })
})
