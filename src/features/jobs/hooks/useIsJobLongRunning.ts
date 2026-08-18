import { useEffect, useState } from 'react'
import { LONG_RUNNING_THRESHOLD_MS } from '../job.config'


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
