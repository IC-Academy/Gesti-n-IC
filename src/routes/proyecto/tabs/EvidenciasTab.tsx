import { useState } from 'react'
import { CheckCircle2, FileText, Image as ImageIcon, XCircle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { EvidenceUploader } from '@/components/gestion/EvidenceUploader'
import { EmptyState } from '@/components/States'
import { useDemoStore, agregarEvidencia, validarEvidencia } from '@/lib/demoStore'
import { evidenciasDeProyecto, usuarioPorId } from '@/lib/demoSelectors'
import { useSession } from '@/lib/session'
import type { EvidenceRef, Project } from '@/lib/types'

const VALIDACION_ESTILO: Record<string, string> = {
  Pendiente: 'bg-amber-50 text-amber-700',
  Validada: 'bg-emerald-50 text-emerald-700',
  Rechazada: 'bg-red-50 text-red-700',
}

export function EvidenciasTab({ project, esGestorDelArea }: { project: Project; esGestorDelArea: boolean }) {
  const state = useDemoStore()
  const { user } = useSession()
  const [nuevas, setNuevas] = useState<EvidenceRef[]>([])
  if (!user) return null

  const evidencias = evidenciasDeProyecto(state, project.id)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Agregar evidencia" subtitle="También puedes adjuntar evidencias al registrar un avance en la pestaña Seguimiento." />
        <CardBody className="space-y-3">
          <EvidenceUploader value={nuevas} onChange={setNuevas} />
          <Button
            disabled={!nuevas.length}
            onClick={() => {
              agregarEvidencia(project.id, user.id, nuevas)
              setNuevas([])
            }}
          >
            Guardar evidencias
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Evidencias del proyecto" subtitle={`${evidencias.length} archivo(s)`} />
        <CardBody>
          {evidencias.length === 0 ? (
            <EmptyState label="Aún no se han cargado evidencias." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {evidencias.map((ev) => {
                const autor = usuarioPorId(state, ev.subidoPorId)
                return (
                  <div key={ev.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      {ev.previewUrl ? (
                        <img src={ev.previewUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : ev.tipo.startsWith('image/') ? (
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      ) : (
                        <FileText className="h-8 w-8 text-slate-300" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">{ev.nombreArchivo}</p>
                        <p className="text-[10px] text-slate-400">{autor?.nombre ?? '—'} · {new Date(ev.subidoEn).toLocaleDateString('es-MX')}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${VALIDACION_ESTILO[ev.validacion]}`}>{ev.validacion.toUpperCase()}</span>
                      {esGestorDelArea && ev.validacion === 'Pendiente' ? (
                        <div className="flex gap-1">
                          <button title="Validar" onClick={() => validarEvidencia(ev.id, 'Validada', user.id)} className="text-emerald-600 hover:text-emerald-800">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button title="Rechazar" onClick={() => validarEvidencia(ev.id, 'Rechazada', user.id, 'No cumple con lo esperado, favor de sustituir el archivo.')} className="text-red-600 hover:text-red-800">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {ev.comentarioValidacion ? <p className="mt-2 text-[10px] text-slate-500">{ev.comentarioValidacion}</p> : null}
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
