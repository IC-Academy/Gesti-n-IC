import { useNavigate } from 'react-router-dom'
import { ListChecks } from 'lucide-react'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { areaPorId } from '@/lib/demoSelectors'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { EmptyState } from '@/components/States'

export function Asignacion() {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  if (!user) return null

  const area = areaPorId(state, user.areaId)
  const pendientes = state.requests.filter(
    (r) => r.estado === 'Pendiente de asignación' && (user.rol === 'admin' || r.areaResponsableSugerida === area?.nombre),
  )

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">ASIGNACIÓN DE RESPONSABLES</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Solicitudes aprobadas por asignar</h1>
        <p className="text-sm text-slate-500">Define responsable, equipo, fechas y prioridad para convertir la solicitud en proyecto.</p>
      </div>
      <section className="gestion-panel">
        {pendientes.length === 0 ? (
          <EmptyState label="No hay solicitudes pendientes de asignación." />
        ) : (
          pendientes.map((r) => (
            <div key={r.id} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-0">
              <div>
                <b className="text-sm text-slate-800">{r.nombreProyecto}</b>
                <p className="text-xs text-slate-400">{r.folio} · {r.areaResponsableSugerida} · Aprobada el {new Date(r.actualizadoEn).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="flex items-center gap-3">
                <PriorityBadge prioridad={r.prioridad} />
                <button onClick={() => nav(`/solicitudes/${r.id}`)} className="gestion-primary flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" /> Asignar
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
