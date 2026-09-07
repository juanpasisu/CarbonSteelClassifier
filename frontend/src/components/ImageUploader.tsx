import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
])
const MAX_BYTES = 25 * 1024 * 1024

interface ImageUploaderProps {
  disabled?: boolean
  loading?: boolean
  onAnalyze: (file: File) => void
  onClearResult?: () => void
}

function validateSelectedFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type) && !/\.(jpe?g|png|webp|tiff?)$/i.test(file.name)) {
    return 'Formato no soportado. Usa JPG, PNG, WEBP o TIFF.'
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return 'El archivo debe pesar entre 1 byte y 25 MB.'
  }
  return null
}

export function ImageUploader({
  disabled = false,
  loading = false,
  onAnalyze,
  onClearResult,
}: ImageUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [localError, setLocalError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function selectFile(nextFile: File | null) {
    setLocalError('')
    onClearResult?.()

    if (!nextFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setFile(null)
      setPreviewUrl(null)
      return
    }

    const validationError = validateSelectedFile(nextFile)
    if (validationError) {
      setLocalError(validationError)
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    selectFile(nextFile)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || loading) {
      return
    }
    const nextFile = event.dataTransfer.files?.[0] ?? null
    selectFile(nextFile)
  }

  return (
    <div>
      <div
        className={`rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition ${
          isDragging
            ? 'border-uis-green bg-uis-green-soft'
            : 'border-emerald-200'
        }`}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-lg font-medium text-slate-800">
          Arrastra una imagen o selecciónala desde tu equipo
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Formatos: JPG, PNG, WEBP, TIFF · máximo 25 MB · sin almacenamiento permanente
        </p>

        <input
          accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,image/jpeg,image/png,image/webp,image/tiff"
          className="sr-only"
          id={inputId}
          onChange={handleInputChange}
          ref={inputRef}
          type="file"
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <label
            className={`cursor-pointer rounded-lg border border-uis-green px-5 py-3 text-sm font-semibold text-uis-green transition hover:bg-uis-green-soft ${
              disabled || loading ? 'pointer-events-none opacity-50' : ''
            }`}
            htmlFor={inputId}
          >
            Seleccionar imagen
          </label>
          <button
            className="rounded-lg bg-uis-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!file || disabled || loading}
            onClick={() => {
              if (file) {
                onAnalyze(file)
              }
            }}
            type="button"
          >
            {loading ? 'Analizando…' : 'Analizar microestructura'}
          </button>
        </div>

        {previewUrl && file && (
          <div className="mx-auto mt-8 max-w-md text-left">
            <p className="mb-2 text-sm font-medium text-slate-700">Vista previa</p>
            <img
              alt={`Vista previa de ${file.name}`}
              className="max-h-72 w-full rounded-xl object-contain bg-slate-100"
              src={previewUrl}
            />
            <p className="mt-2 truncate text-xs text-slate-500">{file.name}</p>
            <button
              className="mt-3 text-sm text-uis-green underline-offset-2 hover:underline"
              disabled={loading}
              onClick={() => selectFile(null)}
              type="button"
            >
              Quitar imagen
            </button>
          </div>
        )}
      </div>

      {localError && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {localError}
        </p>
      )}
    </div>
  )
}
