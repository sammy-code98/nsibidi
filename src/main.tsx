import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element "#root" was not found in the document.')
}

function renderApp() {
  createRoot(rootElement as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

/**
 * Boots the mock API before the first render.
 *
 * The whole backend is mocked, so this always runs — but it is imported
 * dynamically to keep MSW out of the initial bundle. If the worker cannot
 * start, the app still renders and requests surface as normal failures rather
 * than leaving a blank page.
 */
async function bootstrap() {
  try {
    const { startMockApi } = await import('@/mocks/browser')
    await startMockApi()
  } catch (cause) {
    console.error('The mock API failed to start.', cause)
  }

  renderApp()
}

void bootstrap()
