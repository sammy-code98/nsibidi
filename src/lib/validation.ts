import { formatFileSize } from './format'

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg'] as const

export const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg'] as const

export const ACCEPTED_FORMATS_LABEL = 'PNG, JPG or JPEG'

/** Value for the `accept` attribute of a file input. */
export const FILE_INPUT_ACCEPT = [
  ...ACCEPTED_EXTENSIONS,
  ...ACCEPTED_MIME_TYPES,
].join(',')

export const MAX_FILE_SIZE_LABEL = formatFileSize(MAX_FILE_SIZE_BYTES)

export type FileValidationErrorCode =
  | 'unsupported-type'
  | 'too-large'
  | 'empty-file'

/**
 * A rejection reason split into a short headline and a sentence explaining
 * what the user can do next, so the UI never has to invent copy.
 */
export interface FileValidationError {
  code: FileValidationErrorCode
  title: string
  message: string
}

export type FileValidationResult =
  | { ok: true }
  | { ok: false; error: FileValidationError }

function isAcceptedMimeType(type: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(type)
}

function hasAcceptedExtension(name: string): boolean {
  const lowercased = name.toLowerCase()

  return ACCEPTED_EXTENSIONS.some((extension) =>
    lowercased.endsWith(extension),
  )
}


export function validateImageFile(file: File): FileValidationResult {
  // Some browsers report an empty `type` for files dragged from unusual
  // sources, so fall back to the extension before rejecting.
  const typeIsAcceptable = file.type
    ? isAcceptedMimeType(file.type)
    : hasAcceptedExtension(file.name)

  if (!typeIsAcceptable) {
    return {
      ok: false,
      error: {
        code: 'unsupported-type',
        title: 'That file type is not supported',
        message: `${file.name} is not a supported image. Choose a ${ACCEPTED_FORMATS_LABEL} file instead.`,
      },
    }
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: {
        code: 'empty-file',
        title: 'That file is empty',
        message: `${file.name} contains no data. Choose a different image.`,
      },
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: {
        code: 'too-large',
        title: 'That image is too large',
        message: `${file.name} is ${formatFileSize(file.size)}. The limit is ${MAX_FILE_SIZE_LABEL} — choose a smaller image.`,
      },
    }
  }

  return { ok: true }
}
