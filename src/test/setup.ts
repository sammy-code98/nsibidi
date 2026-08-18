import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { afterAll, afterEach, beforeAll } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { FormData as UndiciFormData } from 'undici'
import { resetMockJobs } from '@/mocks/data'
import { server } from '@/mocks/server'

/*
 * jsdom ships its own File/Blob/FormData, which Node's fetch cannot serialise —
 * an upload then hangs forever with no error at all. Node's fetch *is* undici,
 * so these are taken from the same implementations it uses. Doing it globally
 * (rather than converting at the request boundary) also keeps `instanceof File`
 * checks in app code agreeing with what the request handlers receive.
 */
globalThis.File = NodeFile as unknown as typeof globalThis.File
globalThis.Blob = NodeBlob as unknown as typeof globalThis.Blob
globalThis.FormData = UndiciFormData as unknown as typeof globalThis.FormData

// jsdom does not implement object URLs, which the file preview creates.
globalThis.URL.createObjectURL = () => 'blob:test-object-url'
globalThis.URL.revokeObjectURL = () => {}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })

  // Wrapped after MSW installs its interceptor so the URL is resolved before
  // the request reaches a handler.
  const interceptedFetch = globalThis.fetch
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    // Node's fetch requires absolute URLs; a browser resolves relative ones
    // against the document, which is what the API layer assumes.
    const url =
      typeof input === 'string' && input.startsWith('/')
        ? `${globalThis.location.origin}${input}`
        : input

    return interceptedFetch(url, init)
  }) as typeof fetch
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetMockJobs()
})

afterAll(() => {
  server.close()
})
