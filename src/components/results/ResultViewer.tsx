import { useState } from 'react'
import type { JobResult } from '@/features/jobs/job.types'
import { formatDuration, formatTime } from '@/lib/format'

interface ResultViewerProps {
  result: JobResult
}

/** The processed image, with the facts about how it was produced. */
export function ResultViewer({ result }: ResultViewerProps) {
  const [didImageFail, setDidImageFail] = useState(false)

  return (
    <figure className="space-y-3">
      <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-secondary">
        {didImageFail ? (
          <p className="px-6 py-10 text-center text-sm text-muted">
            The processed image could not be displayed, but the job finished
            successfully.
          </p>
        ) : (
          <img
            src={result.result}
            alt={`Processed result for ${result.filename}`}
            className="max-h-[28rem] w-full object-contain"
            onError={() => setDidImageFail(true)}
          />
        )}
      </div>

      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="font-medium text-foreground">{result.filename}</span>
        <span>Finished at {formatTime(result.completed_at)}</span>
        <span>Took {formatDuration(result.processing_time_ms)}</span>
      </figcaption>
    </figure>
  )
}
