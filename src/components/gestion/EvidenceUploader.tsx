import { useRef, useState } from 'react'
import { FileText, Image as ImageIcon, Upload, X } from 'lucide-react'
import type { EvidenceRef } from '@/lib/types'

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const TAMANO_MAXIMO_BYTES = 8 * 1024 * 1024 // 8MB por archivo
const TAMANO_MAXIMO_PREVIEW_BYTES = 400 * 1024 // solo generamos vista previa (data URL) para imágenes pequeñas
const MAX_ARCHIVOS = 6

function tamanoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Carga de evidencias en modo demo: valida tipo y tamaño en el navegador y
 * conserva metadatos (y, para imágenes pequeñas, una vista previa local). No
 * sube nada a ningún servidor — cuando exista un backend/n8n para evidencias,
 * este componente puede seguir emitiendo los mismos EvidenceRef[] y solo
 * cambia qué hace la pantalla que los recibe con ellos.
 */
export function EvidenceUploader({ value, onChange }: { value: EvidenceRef[]; onChange: (files: EvidenceRef[]) => void }) {
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    setError(null)
    const files = Array.from(fileList)
    if (value.length + files.length > MAX_ARCHIVOS) {
      setError(`Puedes cargar máximo ${MAX_ARCHIVOS} archivos por registro.`)
      return
    }
    const nuevos: EvidenceRef[] = []
    for (const file of files) {
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        setError(`"${file.name}" no es un tipo de archivo permitido (usa imágenes, PDF o Word/Excel).`)
        continue
      }
      if (file.size > TAMANO_MAXIMO_BYTES) {
        setError(`"${file.name}" pesa ${tamanoLegible(file.size)}; el máximo permitido es ${tamanoLegible(TAMANO_MAXIMO_BYTES)}.`)
        continue
      }
      let previewUrl: string | undefined
      if (file.type.startsWith('image/') && file.size <= TAMANO_MAXIMO_PREVIEW_BYTES) {
        previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => resolve('')
          reader.readAsDataURL(file)
        })
      }
      nuevos.push({ nombreArchivo: file.name, tipo: file.type, tamanoBytes: file.size, previewUrl: previewUrl || undefined })
    }
    if (nuevos.length) onChange([...value, ...nuevos])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="evidence-drop">
        <input ref={inputRef} type="file" multiple accept={TIPOS_PERMITIDOS.join(',')} onChange={(e) => handleFiles(e.target.files)} />
        <Upload />
        <b>Agregar evidencias</b>
        <small>Fotografías, PDF y Office · máximo {MAX_ARCHIVOS} archivos, 8 MB cada uno</small>
      </label>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
      {value.length ? (
        <ul className="space-y-2">
          {value.map((f, i) => (
            <li key={`${f.nombreArchivo}-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              {f.previewUrl ? (
                <img src={f.previewUrl} alt="" className="h-9 w-9 rounded object-cover" />
              ) : f.tipo.startsWith('image/') ? (
                <ImageIcon className="h-5 w-5 text-slate-400" />
              ) : (
                <FileText className="h-5 w-5 text-slate-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-700">{f.nombreArchivo}</p>
                <p className="text-[10px] text-slate-400">{tamanoLegible(f.tamanoBytes)}</p>
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600" aria-label={`Quitar ${f.nombreArchivo}`}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
