import { useCallback, useState } from 'react'
import type { FileValidationError } from '@/lib/validation'
import { validateImageFile } from '@/lib/validation'

interface FileSelection {
  /** The currently selected file, or `null` when nothing valid is selected. */
  file: File | null
  /** Why the last attempted selection was rejected, if it was. */
  error: FileValidationError | null
  /** Validates a file and either selects it or records why it was rejected. */
  selectFile: (file: File) => void
  /** Clears both the selection and any error. */
  clearSelection: () => void
}

/**
 * Owns "which file is staged for upload", including validation.
 *
 * Keeping this out of the UI means the dropzone only deals with input
 * mechanics, and the rules live in one place ({@link validateImageFile}).
 */
export function useFileSelection(): FileSelection {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<FileValidationError | null>(null)

  const selectFile = useCallback((candidate: File) => {
    const result = validateImageFile(candidate)

    if (!result.ok) {
      // Drop the previous selection so an invalid choice can never be
      // submitted by mistake.
      setFile(null)
      setError(result.error)
      return
    }

    setFile(candidate)
    setError(null)
  }, [])

  const clearSelection = useCallback(() => {
    setFile(null)
    setError(null)
  }, [])

  return { file, error, selectFile, clearSelection }
}
