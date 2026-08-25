import type {
  ApiJob,
  CreateJobResponse,
  JobResult,
} from "@/features/jobs/job.types";
import { apiFetch } from "./client";

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
    const formData = new FormData();
    formData.append("file", file);
    // The service identifies the upload by its filename. A File's own name is
    // not reliably carried through a multipart body in every runtime, so the
    // name is also sent as a plain text field, which always is.
    formData.append("filename", file.name);

    return apiFetch<CreateJobResponse>("/jobs", {
      method: "POST",
      body: formData,
    });
  },

  /** Reads a job's current status. */
  async get(jobId: string): Promise<ApiJob> {
    return apiFetch<ApiJob>(`/jobs/${encodeURIComponent(jobId)}`);
  },

  /**
   * Reads a completed job's result.
   *
   * Fails if the job has not finished — the caller is expected to ask only
   * once the job's status is `complete`.
   */
  async getResult(jobId: string): Promise<JobResult> {
    return apiFetch<JobResult>(`/jobs/${encodeURIComponent(jobId)}/result`);
  },
};
