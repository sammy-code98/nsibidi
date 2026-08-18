import { useEffect, useState } from 'react'
import { LONG_RUNNING_THRESHOLD_MS } from '../job.config'

/**
 * Whether a still-running job has been going longer than usual.
 *
 * Uses a single timeout for the remaining time rather than an interval: the
 * answer only changes once, so there is nothing to poll. The timeout is
 * cleared when the job settles or the component unmounts, and the value resets
 * to false the moment the job is no longer active.
 */
export function useIsJobLongRunning(
  startedAt: string | undefined,
  isActive: boolean,
): boolean {
  const [isLongRunning, setIsLongRunning] = useState(false)

  useEffect(() => {
    if (!isActive || !startedAt) {
      setIsLongRunning(false)
      return
    }

    const startedMs = new Date(startedAt).getTime()

    if (Number.isNaN(startedMs)) {
      setIsLongRunning(false)
      return
    }

    const remaining = startedMs + LONG_RUNNING_THRESHOLD_MS - Date.now()

    if (remaining <= 0) {
      setIsLongRunning(true)
      return
    }

    setIsLongRunning(false)
    const timeout = setTimeout(() => setIsLongRunning(true), remaining)

    return () => {
      clearTimeout(timeout)
    }
  }, [startedAt, isActive])

  return isLongRunning
}
