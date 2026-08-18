/** Base path every endpoint is mounted under. */
export const API_BASE_URL = ''

/**
 * A failed HTTP call.
 *
 * `status` is `null` when the request never reached the server (offline, DNS
 * failure, connection reset), which callers use to tell "you are offline" apart
 * from "the server said no".
 */
export class ApiError extends Error {
  readonly status: number | null
  readonly body: unknown

  constructor(message: string, status: number | null, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body ?? null
  }

  /** True when the request never reached the server. */
  get isNetworkError(): boolean {
    return this.status === null
  }

  /** True for 5xx responses, which are usually worth retrying as-is. */
  get isServerError(): boolean {
    return this.status !== null && this.status >= 500
  }
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  try {
    return contentType.includes('application/json')
      ? await response.json()
      : await response.text()
  } catch {
    return null
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body
  }

  if (body && typeof body === 'object' && 'error' in body) {
    const { error } = body as { error: unknown }

    if (typeof error === 'string' && error.trim()) {
      return error
    }
  }

  return fallback
}

/**
 * Performs a JSON HTTP request, throwing {@link ApiError} on any failure.
 *
 * This is the only place in the app that touches `fetch`.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch (cause) {
    // `fetch` only rejects when the request could not be made at all.
    throw new ApiError(
      cause instanceof Error ? cause.message : 'Network request failed',
      null,
    )
  }

  if (!response.ok) {
    const body = await readBody(response)

    throw new ApiError(
      messageFromBody(body, `Request failed with status ${response.status}`),
      response.status,
      body,
    )
  }

  return (await response.json()) as T
}
