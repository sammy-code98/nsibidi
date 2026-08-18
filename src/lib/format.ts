const KILOBYTE = 1024
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

/**
 * Formats a byte count for display, e.g. `1536` -> `1.5 KB`.
 *
 * Rounds to one decimal place, dropping a trailing `.0` so round numbers read
 * as `10 MB` rather than `10.0 MB`.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(KILOBYTE)),
    SIZE_UNITS.length - 1,
  )
  const unit = SIZE_UNITS[unitIndex] ?? 'B'
  const value = bytes / KILOBYTE ** unitIndex

  if (unitIndex === 0) {
    return `${Math.round(value)} ${unit}`
  }

  const rounded = Math.round(value * 10) / 10

  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${unit}`
}

/**
 * Human-friendly label for an image file's format, e.g. `PNG`.
 *
 * Falls back to the file extension when the browser reports no MIME type.
 */
export function formatFileType(file: File): string {
  const subtype = file.type.split('/')[1]

  if (subtype) {
    return subtype.toUpperCase()
  }

  const extension = file.name.split('.').pop()

  return extension ? extension.toUpperCase() : 'Unknown'
}

/** Formats a duration in milliseconds as a short human string, e.g. `8.4s`. */
export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '0s'
  }

  const seconds = milliseconds / 1000

  if (seconds < 60) {
    const rounded = Math.round(seconds * 10) / 10
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)

  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`
}

/** Formats an ISO timestamp as a local time, e.g. `14:32`. */
export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}
