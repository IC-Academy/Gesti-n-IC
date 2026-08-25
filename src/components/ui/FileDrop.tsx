import { useRef, useState, type DragEvent } from 'react'
import { UploadCloud, X, FileImage } from 'lucide-react'
import { classNames } from '../../lib/format'

export interface ArchivoSeleccionado {
  nombre: string
  tipo: string
  url: string
}

export function FileDrop({
  label,
  hint = 'Formatos: JPG, PNG o PDF. Máximo 5 archivos.',
  archivos,
  onChange,
  max = 5,
}: {
  label?: string
  hint?: string
  archivos: ArchivoSeleccionado[]
  onChange: (archivos: ArchivoSeleccionado[]) => void
  max?: number
}) {
  const [arrastrando, setArrastrando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const agregarArchivos = async (lista: FileList | null) => {
    if (!lista) return
    const disponibles = Math.max(0, max - archivos.length)
    const seleccionados = Array.from(lista).slice(0, disponibles)
    const leidos = await Promise.all(
      seleccionados.map(
        (file) =>
          new Promise<ArchivoSeleccionado>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve({ nombre: file.name, tipo: file.type, url: String(reader.result) })
            reader.readAsDataURL(file)
          }),
      ),
    )
    onChange([...archivos, ...leidos])
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-sm font-medium text-ic-ink">{label}</p>}
      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          setArrastrando(false)
          void agregarArchivos(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={classNames(
          'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition focus-ring',
          arrastrando ? 'border-ic-blue-500 bg-ic-blue-50' : 'border-ic-line bg-slate-50 hover:bg-ic-blue-50/50',
        )}
      >
        <UploadCloud className="h-6 w-6 text-ic-blue-700" aria-hidden="true" />
        <p className="text-sm text-ic-slate">
          Arrastra tus archivos aquí o <span className="font-semibold text-ic-blue-800">selecciónalos</span>
        </p>
        {hint && <p className="text-xs text-ic-slate">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => void agregarArchivos(e.target.files)}
        />
      </div>
      {archivos.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1.5">
          {archivos.map((a, idx) => (
            <li key={`${a.nombre}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg border border-ic-line bg-white px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ic-ink">
                <FileImage className="h-4 w-4 shrink-0 text-ic-blue-700" aria-hidden="true" />
                <span className="truncate">{a.nombre}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(archivos.filter((_, i) => i !== idx))}
                className="rounded p-1 text-ic-slate hover:bg-slate-100 hover:text-red-600 focus-ring"
                aria-label={`Quitar ${a.nombre}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
