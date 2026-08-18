import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * The mock API for tests.
 *
 * Shares its handlers with the browser worker, so tests exercise exactly the
 * same service behaviour the app talks to at runtime.
 */
export const server = setupServer(...handlers)
