import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock3, FolderKanban, Lock, TrendingUp } from 'lucide-react'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { proyectosDeArea, proyectosDeUsuario, calcularKpis, estaAtrasado, estaBloqueado, estaProximoAVencer, sinActualizacionReciente, usuarioPorId, areaPorId, solicitudesDeArea } from '@/lib/demoSelectors'
import { PROJECT_STATUSES, PRIORITIES } from '@/lib/catalog'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { ProgressBar } from '@/components/gestion/ProgressBar'
import { KpiRow } from '@/components/gestion/KpiRow'
import { EmptyState } from '@/components/States'
import type { Project } from '@/lib/types'

export function ProjectsListPage({ scope, title, subtitle }: { scope: 'own' | 'area' | 'all'; title: string; subtitle: string }) {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [areaFiltro, setAreaFiltro] = useState('')
  const [prioridadFiltro, setPrioridadFiltro] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const base: Project[] = useMemo(() => {
    if (!user) return []
    if (scope === 'own') return proyectosDeUsuario(state, user.id)
    if (scope === 'area') return proyectosDeArea(state, user.areaId)
    return state.projects
  }, [state, user, scope])

  const filtrados = base.filter((p) => {
    if (estadoFiltro && p.estado !== estadoFiltro) return false
    if (areaFiltro && p.areaId !== areaFiltro) return false
    if (prioridadFiltro && p.prioridad !== prioridadFiltro) return false
    if (busqueda && !`${p.nombre} ${p.folio}`.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  const solicitudesRelacionadas = user && scope !== 'own' ? solicitudesDeArea(state, areaPorId(state, user.areaId)?.nombre ?? '') : []
  const kpis = calcularKpis(base, scope === 'area' ? solicitudesRelacionadas : state.requests)

  if (!user) return null

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">EJECUCIÓN · PROYECTOS +30 DÍAS</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <KpiRow
        items={[
          { icon: FolderKanban, value: kpis.activos, label: 'ACTIVOS', tone: 0 },
          { icon: Clock3, value: kpis.atrasados, label: 'ATRASADOS', tone: 1 },
          { icon: Lock, value: kpis.bloqueados, label: 'BLOQUEADOS', tone: 3 },
          { icon: TrendingUp, value: `${kpis.avancePromedio}%`, label: 'AVANCE PROMEDIO', tone: 2 },
        ]}
      />

      <section className="gestion-panel">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o folio…"
            className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs"
          />
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-xs">
            <option value="">Todos los estados</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {scope === 'all' ? (
            <select value={areaFiltro} onChange={(e) => setAreaFiltro(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-xs">
              <option value="">Todas las áreas</option>
              {state.areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          ) : null}
          <select value={prioridadFiltro} onChange={(e) => setPrioridadFiltro(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-xs">
            <option value="">Toda prioridad</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {filtrados.length === 0 ? (
          <EmptyState label="No hay proyectos que coincidan con los filtros." />
        ) : (
          <div className="overflow-auto">
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>PROYECTO</th>
                  <th>ÁREA</th>
                  <th>RESPONSABLE</th>
                  <th>PRIORIDAD</th>
                  <th>ESTADO</th>
                  <th>AVANCE</th>
                  <th>ENTREGA</th>
                  <th>ALERTAS</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const responsable = usuarioPorId(state, p.responsableId)
                  const area = areaPorId(state, p.areaId)
                  return (
                    <tr key={p.id} className="cursor-pointer hover:bg-slate-50" onClick={() => nav(`/proyectos/${p.id}`)}>
                      <td>
                        <b>{p.nombre}</b>
                        <small>{p.folio}</small>
                      </td>
                      <td>{area?.nombre ?? '—'}</td>
                      <td>{responsable?.nombre ?? '—'}</td>
                      <td><PriorityBadge prioridad={p.prioridad} /></td>
                      <td><StatusBadge estado={p.estado} /></td>
                      <td className="w-32">
                        <div className="flex items-center gap-2">
                          <div className="w-16"><ProgressBar avance={p.avance} bloqueado={p.bloqueado} size="sm" /></div>
                          <span className="text-[11px] font-semibold">{p.avance}%</span>
                        </div>
                      </td>
                      <td>{new Date(p.fechaFinEstimada).toLocaleDateString('es-MX')}</td>
                      <td>
                        <div className="flex gap-1">
                          {estaAtrasado(p) ? <span title="Atrasado" className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">ATRASADO</span> : null}
                          {estaBloqueado(p) ? <span title="Bloqueado" className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">BLOQUEADO</span> : null}
                          {estaProximoAVencer(p) ? <span title="Próximo a vencer" className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">POR VENCER</span> : null}
                          {sinActualizacionReciente(p) ? <span title="Sin actualización reciente" className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500"><AlertTriangle className="h-2.5 w-2.5" />SIN ACTUALIZAR</span> : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
