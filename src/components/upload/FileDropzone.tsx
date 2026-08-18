import { cn } from '@heroui/react'
import type { DragEvent, ChangeEvent } from 'react'
import { useCallback, useId, useRef, useState } from 'react'
import {
  ACCEPTED_FORMATS_LABEL,
  FILE_INPUT_ACCEPT,
  MAX_FILE_SIZE_LABEL,
} from '@/lib/validation'
import { UploadIcon } from './UploadIcon'

interface FileDropzoneProps {
  /** Called with the chosen file. Validation is the caller's responsibility. */
  onFileSelected: (file: File) => void
  isDisabled?: boolean
}

/**
 * Drag-and-drop plus click-to-browse image picker.
 *
 * Built around a real `<input type="file">` rather than a `div` with click
 * handlers: the input stays in the tab order and opens the picker on
 * Enter/Space, so keyboard and screen-reader users get the same affordance
 * without any custom key handling. Drag-and-drop is layered on top as an
 * enhancement for pointer users.
 */
export function FileDropzone({ onFileSelected, isDisabled }: FileDropzoneProps) {
  const inputId = useId()
  const hintId = useId()
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Drag events fire for descendants too, so a plain boolean would flicker as
  // the pointer moves between the label and the hint text.
  const dragDepth = useRef(0)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]

      if (file) {
        onFileSelected(file)
      }
    },
    [onFileSelected],
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files)
    // Reset so re-picking the same file still fires a change event.
    event.target.value = ''
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (isDisabled) return
    event.preventDefault()
    dragDepth.current += 1
    setIsDraggingOver(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (isDisabled) return
    // Required for the element to be a valid drop target.
    event.preventDefault()
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (isDisabled) return
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)

    if (dragDepth.current === 0) {
      setIsDraggingOver(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (isDisabled) return
    event.preventDefault()
    dragDepth.current = 0
    setIsDraggingOver(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-dragging={isDraggingOver || undefined}
      className={cn(
        'rounded-xl border-2 border-dashed border-border bg-surface-secondary/40 transition-colors',
        'has-[input:focus-visible]:border-accent has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-focus',
        isDraggingOver && 'border-accent bg-accent-soft/50',
        isDisabled && 'opacity-60',
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={FILE_INPUT_ACCEPT}
        className="sr-only"
        onChange={handleChange}
        disabled={isDisabled}
        aria-describedby={hintId}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'flex flex-col items-center justify-center gap-3 px-6 py-10 text-center',
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-surface text-muted">
          <UploadIcon className="size-5" />
        </span>
        <span className="space-y-1">
          <span className="block text-sm font-medium text-foreground">
            Drag an image here, or{' '}
            <span className="text-accent underline underline-offset-2">
              browse your files
            </span>
          </span>
          <span id={hintId} className="block text-xs text-muted">
            {ACCEPTED_FORMATS_LABEL} · up to {MAX_FILE_SIZE_LABEL}
          </span>
        </span>
      </label>
    </div>
  )
}
