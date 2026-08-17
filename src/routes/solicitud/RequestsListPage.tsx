import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { areaPorId, solicitudesDeArea } from '@/lib/demoSelectors'
import { PROJECT_STATUSES, ESTADOS_SOLICITUD_PROYECTOS } from '@/lib/catalog'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { EmptyState } from '@/components/States'
import type { ProjectRequest } from '@/lib/types'

export function RequestsListPage({ scope, title, subtitle, soloAbiertas }: { scope: 'area' | 'all'; title: string; subtitle: string; soloAbiertas?: boolean }) {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const base: ProjectRequest[] = useMemo(() => {
    if (!user) return []
    if (scope === 'area') return solicitudesDeArea(state, areaPorId(state, user.areaId)?.nombre ?? '')
    return state.requests
  }, [state, user, scope])

  const abiertas = soloAbiertas ? base.filter((r) => (ESTADOS_SOLICITUD_PROYECTOS as string[]).includes(r.estado)) : base

  const filtradas = abiertas.filter((r) => {
    if (estadoFiltro && r.estado !== estadoFiltro) return false
    if (busqueda && !`${r.nombreProyecto} ${r.folio} ${r.nombreSolicitante}`.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  if (!user) return null

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">SOLICITUDES DE PROYECTO</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <section className="gestion-panel">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4">
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, folio o solicitante…" className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs" />
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-xs">
            <option value="">Todos los estados</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {filtradas.length === 0 ? (
          <EmptyState label="No hay solicitudes que coincidan." />
        ) : (
          <div className="overflow-auto">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>SOLICITUD</th>
                  <th>SOLICITANTE</th>
                  <th>ÁREA SUGERIDA</th>
                  <th>PRIORIDAD</th>
                  <th>ESTADO</th>
                  <th>RECIBIDA</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => nav(`/solicitudes/${r.id}`)}>
                    <td><b>{r.nombreProyecto}</b><small>{r.folio}</small></td>
                    <td>{r.nombreSolicitante}<br /><small className="text-[10px] text-slate-400">{r.correoSolicitante}</small></td>
                    <td>{r.areaResponsableSugerida}</td>
                    <td><PriorityBadge prioridad={r.prioridad} /></td>
                    <td><StatusBadge estado={r.estado} /></td>
                    <td>{new Date(r.creadoEn).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
