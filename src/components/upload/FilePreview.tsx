import { Button } from '@heroui/react'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { formatFileSize, formatFileType } from '@/lib/format'

interface FilePreviewProps {
  file: File
  /** Removes the selected file. Omit to render a read-only preview. */
  onRemove?: () => void
  isRemoveDisabled?: boolean
}

/** Thumbnail and metadata for the image staged for upload. */
export function FilePreview({
  file,
  onRemove,
  isRemoveDisabled,
}: FilePreviewProps) {
  const previewUrl = useObjectUrl(file)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-secondary">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="size-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatFileType(file)} · {formatFileSize(file.size)}
        </p>
      </div>

      {onRemove ? (
        <Button
          variant="ghost"
          size="sm"
          onPress={onRemove}
          isDisabled={isRemoveDisabled}
        >
          Remove
          <span className="sr-only"> {file.name}</span>
        </Button>
      ) : null}
    </div>
  )
}
