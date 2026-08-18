import type { CreateJobResponse } from '@/features/jobs/job.types'
import { apiFetch } from './client'

/**
 * The job API, mirroring the documented contract.
 *
 * Components and hooks call these methods; nothing else in the app knows the
 * endpoint shapes or that HTTP is involved at all.
 */
export const jobsApi = {
  /**
   * Submits an image for processing.
   *
   * Resolves as soon as the job is accepted — the returned job is `queued`,
   * not finished.
   */
  async create(file: File): Promise<CreateJobResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return apiFetch<CreateJobResponse>('/jobs', {
      method: 'POST',
      body: formData,
    })
  },
}
