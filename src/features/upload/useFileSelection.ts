import { useCallback, useState } from 'react'
import type { FileValidationError } from '@/lib/validation'
import { validateImageFile } from '@/lib/validation'

interface FileSelection {
  file: File | null;
  error: FileValidationError | null;
  selectFile: (file: File) => void;
  clearSelection: () => void;
}

export function useFileSelection(): FileSelection {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<FileValidationError | null>(null)

  const selectFile = useCallback((candidate: File) => {
    const result = validateImageFile(candidate)

    if (!result.ok) {
      setFile(null);
      setError(result.error);
      return;
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
