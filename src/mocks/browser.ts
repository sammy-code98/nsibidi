import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Starts the mock API.
 *
 * The app has no real backend, so this runs in every environment. Requests the
 * handlers do not describe (Vite assets, the worker script itself) pass
 * straight through.
 */
export async function startMockApi(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}
