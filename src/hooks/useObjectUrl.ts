import { useEffect, useState } from 'react'

/**
 * Creates an object URL for a file and revokes it when the file changes or the
 * component unmounts, so previews never leak blob URLs.
 */
export function useObjectUrl(file: File | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setObjectUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setObjectUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return objectUrl
}
