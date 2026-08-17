import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, FileText, Image as ImageIcon, XCircle } from 'lucide-react'
import { useDemoStore, validarEvidencia } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { proyectosDeArea, usuarioPorId } from '@/lib/demoSelectors'
import { EmptyState } from '@/components/States'

export function ValidacionEvidencias() {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  const [rechazando, setRechazando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  if (!user) return null

  const proyectosVisibles = user.rol === 'admin' ? state.projects : proyectosDeArea(state, user.areaId)
  const idsProyectos = new Set(proyectosVisibles.map((p) => p.id))
  const pendientes = state.evidences.filter((e) => e.validacion === 'Pendiente' && idsProyectos.has(e.projectId))

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">CALIDAD Y CUMPLIMIENTO</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Validación de evidencias</h1>
        <p className="text-sm text-slate-500">Revisa y valida (o rechaza) las evidencias cargadas por el equipo.</p>
      </div>

      {pendientes.length === 0 ? (
        <EmptyState label="No hay evidencias pendientes de validación." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pendientes.map((ev) => {
            const proyecto = state.projects.find((p) => p.id === ev.projectId)
            const autor = usuarioPorId(state, ev.subidoPorId)
            return (
              <div key={ev.id} className="gestion-panel p-4">
                <button onClick={() => nav(`/proyectos/${ev.projectId}?tab=evidencias`)} className="text-left">
                  <b className="block text-xs text-blue-700 hover:underline">{proyecto?.nombre ?? 'Proyecto'}</b>
                </button>
                <div className="mt-2 flex items-center gap-2">
                  {ev.previewUrl ? <img src={ev.previewUrl} alt="" className="h-10 w-10 rounded object-cover" /> : ev.tipo.startsWith('image/') ? <ImageIcon className="h-8 w-8 text-slate-300" /> : <FileText className="h-8 w-8 text-slate-300" />}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">{ev.nombreArchivo}</p>
                    <p className="text-[10px] text-slate-400">{autor?.nombre ?? '—'} · {new Date(ev.subidoEn).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
                {rechazando === ev.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} placeholder="Motivo del rechazo" className="w-full rounded-md border border-slate-300 p-2 text-xs" />
                    <div className="flex gap-2">
                      <button
                        className="gestion-primary !bg-red-600 hover:!bg-red-700"
                        disabled={!motivo.trim()}
                        onClick={() => { validarEvidencia(ev.id, 'Rechazada', user.id, motivo.trim()); setRechazando(null); setMotivo('') }}
                      >
                        Confirmar rechazo
                      </button>
                      <button className="gestion-secondary" onClick={() => setRechazando(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => validarEvidencia(ev.id, 'Validada', user.id)} className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Validar
                    </button>
                    <button onClick={() => setRechazando(ev.id)} className="flex items-center gap-1 text-xs font-semibold text-red-600">
                      <XCircle className="h-4 w-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
