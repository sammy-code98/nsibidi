import { afterEach, describe, expect, it } from 'vitest'
import { jobsApi } from '@/api/jobs'
import { ApiError } from '@/api/client'
import { imageFile, createFakeClock } from '@/test/utils'

const clock = createFakeClock()
afterEach(() => clock.reset())

describe('the mock job service', () => {
  it('accepts a job and reports it as queued, never complete', async () => {
    const created = await jobsApi.create(imageFile('success-a.png'))

    expect(created.job_id).toMatch(/^job_/)
    expect(created.status).toBe('queued')

    const immediately = await jobsApi.get(created.job_id)
    expect(immediately.status).toBe('queued')
    expect(immediately.result).toBeNull()
    expect(immediately.error).toBeNull()
  })

  it('moves a job through queued, processing, then complete', async () => {
    const created = await jobsApi.create(imageFile('success-b.png'))
    const seen: string[] = []

    seen.push((await jobsApi.get(created.job_id)).status)
    clock.advance(4_500)
    seen.push((await jobsApi.get(created.job_id)).status)
    clock.advance(60_000)
    seen.push((await jobsApi.get(created.job_id)).status)

    expect(seen).toEqual(['queued', 'processing', 'complete'])
  })

  it('moves a failing job through queued, processing, then failed', async () => {
    const created = await jobsApi.create(imageFile('broken-a.png'))
    const seen: string[] = []

    seen.push((await jobsApi.get(created.job_id)).status)
    clock.advance(4_500)
    seen.push((await jobsApi.get(created.job_id)).status)
    clock.advance(60_000)
    seen.push((await jobsApi.get(created.job_id)).status)

    expect(seen).toEqual(['queued', 'processing', 'failed'])
  })

  it('gives a failed job a specific reason and no result', async () => {
    const created = await jobsApi.create(imageFile('broken-b.png'))
    clock.advance(60_000)

    const job = await jobsApi.get(created.job_id)

    expect(job.status).toBe('failed')
    expect(job.result).toBeNull()
    expect(job.error).toEqual(expect.stringMatching(/\w+/))
    expect(job.error!.length).toBeGreaterThan(20)
  })

  it('refuses a result until the job is complete', async () => {
    const created = await jobsApi.create(imageFile('slow-a.png'))

    await expect(jobsApi.getResult(created.job_id)).rejects.toMatchObject({
      status: 409,
    })
  })

  it('returns a result once complete', async () => {
    const created = await jobsApi.create(imageFile('success-c.png'))
    clock.advance(60_000)

    const result = await jobsApi.getResult(created.job_id)

    expect(result.job_id).toBe(created.job_id)
    expect(result.result).toBe(`/jobs/${created.job_id}/image`)
    expect(result.processing_time_ms).toBeGreaterThanOrEqual(5_000)
  })

  it('serves the processed image bytes once complete', async () => {
    const created = await jobsApi.create(imageFile('success-d.png'))
    clock.advance(60_000)

    const response = await fetch(`/jobs/${created.job_id}/image`)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0)
  })

  it('reports an unknown job as missing', async () => {
    await expect(jobsApi.get('job_missing')).rejects.toBeInstanceOf(ApiError)
    await expect(jobsApi.get('job_missing')).rejects.toMatchObject({
      status: 404,
    })
  })

  it('keeps jobs independent of one another', async () => {
    const failing = await jobsApi.create(imageFile('broken-c.png'))
    const slow = await jobsApi.create(imageFile('slow-b.png'))
    clock.advance(20_000)

    expect((await jobsApi.get(failing.job_id)).status).toBe('failed')
    expect((await jobsApi.get(slow.job_id)).status).toBe('processing')
  })
})
