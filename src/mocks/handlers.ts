import { HttpResponse, delay, http } from "msw";
import type {
  ApiJob,
  CreateJobResponse,
  JobResult,
} from "@/features/jobs/job.types";
import { detectScenario } from "./config";
import {
  createMockJob,
  deriveStatus,
  getMockJob,
  responseDelayMs,
} from "./data";

/**
 * Builds a request pattern for an endpoint.
 *
 * The origin is wildcarded so the same handlers work in the browser, where
 * requests are same-origin, and under `setupServer` in tests, where there is no
 * `location` for a relative path to be resolved against.
 */
function endpoint(path: string): string {
  return `*${path}`;
}

function notFound(jobId: string) {
  return HttpResponse.json(
    { error: `No job exists with the id "${jobId}".` },
    { status: 404 },
  );
}

/**
 * Whether a form field is an uploaded file.
 *
 * Checked structurally rather than with `instanceof File`. In the browser the
 * value is a genuine `File`, but across the test boundary the value parsed out
 * of the multipart body can be a `File` produced by a *different* realm — Node's
 * built-in undici versus the polyfilled globals — and cross-realm `instanceof`
 * is unreliable and varies by Node major (it holds on Node 20/22 but not 24).
 * The handler only needs the file's name, type and bytes, so it verifies those
 * are present instead of asserting a particular constructor.
 */
function isUploadedFile(
  value: FormDataEntryValue | null | undefined,
): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).name === "string" &&
    typeof (value as Blob).arrayBuffer === "function"
  );
}

/**
 * Mock implementation of the job API.
 *
 * Deliberately asynchronous: a job is never complete when it is created, and
 * only reaches a terminal status after the simulated processing time has
 * actually elapsed.
 */
export const handlers = [
  /** Accepts an image and queues it. Returns immediately. */
  http.post(endpoint("/jobs"), async ({ request }) => {
    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");

    if (!isUploadedFile(file)) {
      await delay(responseDelayMs());

      return HttpResponse.json(
        { error: "No image was included in the request." },
        { status: 400 },
      );
    }

    // Simulates the service refusing the upload outright.
    if (detectScenario(file.name) === "reject") {
      await delay(responseDelayMs());

      return HttpResponse.json(
        { error: "The processing service is not accepting uploads right now." },
        { status: 503 },
      );
    }

    const job = await createMockJob(file);
    await delay(responseDelayMs());

    return HttpResponse.json<CreateJobResponse>(
      { job_id: job.id, status: "queued" },
      { status: 202 },
    );
  }),

  /** Reports the current status of a job. */
  http.get(endpoint("/jobs/:jobId"), async ({ params }) => {
    const jobId = String(params.jobId);
    const job = getMockJob(jobId);

    await delay(responseDelayMs());

    if (!job) {
      return notFound(jobId);
    }

    const status = deriveStatus(job);

    return HttpResponse.json<ApiJob>({
      job_id: job.id,
      status,
      result: status === "complete" ? job.resultUrl : null,
      error: status === "failed" ? job.error : null,
    });
  }),

  /**
   * Serves the processed image itself.
   *
   * The result endpoint returns this URL rather than inline image data, which
   * is both closer to how a real service behaves and avoids passing megabytes
   * of base64 through the worker boundary.
   */
  http.get(endpoint("/jobs/:jobId/image"), async ({ params }) => {
    const jobId = String(params.jobId);
    const job = getMockJob(jobId);

    if (!job) {
      return notFound(jobId);
    }

    if (deriveStatus(job) !== "complete") {
      return HttpResponse.json(
        { error: "This image is not ready yet." },
        { status: 409 },
      );
    }

    return HttpResponse.arrayBuffer(job.imageBytes, {
      headers: { "Content-Type": job.imageType },
    });
  }),

  /** Returns the processed result, but only once the job is complete. */
  http.get(endpoint("/jobs/:jobId/result"), async ({ params }) => {
    const jobId = String(params.jobId);
    const job = getMockJob(jobId);

    await delay(responseDelayMs());

    if (!job) {
      return notFound(jobId);
    }

    const status = deriveStatus(job);

    if (status === "failed") {
      return HttpResponse.json(
        { error: "This job failed, so it has no result." },
        { status: 409 },
      );
    }

    if (status !== "complete") {
      return HttpResponse.json(
        {
          error:
            "This result is not ready yet. The image is still being processed.",
        },
        { status: 409 },
      );
    }

    // Simulates a result that exists but cannot be retrieved.
    if (job.resultIsUnavailable) {
      return HttpResponse.json(
        { error: "The result could not be retrieved from storage." },
        { status: 500 },
      );
    }

    return HttpResponse.json<JobResult>({
      job_id: job.id,
      filename: job.filename,
      result: job.resultUrl,
      completed_at: new Date(job.finishesAt).toISOString(),
      processing_time_ms: Math.round(job.finishesAt - job.startsProcessingAt),
    });
  }),
];
