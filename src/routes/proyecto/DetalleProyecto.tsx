import { useParams, useSearchParams } from 'react-router-dom'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { esParticipante, puedeAdministrarArea } from '@/lib/permissions'
import { areaPorId, usuarioPorId, estaAtrasado, estaBloqueado, estaProximoAVencer } from '@/lib/demoSelectors'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { ProgressBar } from '@/components/gestion/ProgressBar'
import { Alert } from '@/components/gestion/Alert'
import { EmptyState } from '@/components/States'
import { ResumenTab } from './tabs/ResumenTab'
import { SeguimientoTab } from './tabs/SeguimientoTab'
import { EvidenciasTab } from './tabs/EvidenciasTab'
import { HistorialTab } from './tabs/HistorialTab'

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'seguimiento', label: 'Seguimiento' },
  { id: 'evidencias', label: 'Evidencias' },
  { id: 'historial', label: 'Historial' },
] as const

export function DetalleProyecto() {
  const { id } = useParams<{ id: string }>()
  const state = useDemoStore()
  const { user } = useSession()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'resumen'

  const project = state.projects.find((p) => p.id === id)

  if (!user) return null
  if (!project) return <EmptyState label="No encontramos este proyecto." />

  const puedeVer = user.rol === 'admin' || (user.rol === 'lider' && puedeAdministrarArea(user, project.areaId)) || (user.rol === 'usuario' && esParticipante(user.id, project.equipoIds, project.responsableId))

  if (!puedeVer) {
    return <Alert tone="error" title="Sin acceso">No tienes permiso para ver este proyecto. Si crees que es un error, contacta a tu líder de área.</Alert>
  }

  const esGestorDelArea = user.rol === 'admin' || (user.rol === 'lider' && puedeAdministrarArea(user, project.areaId))
  const area = areaPorId(state, project.areaId)
  const responsable = usuarioPorId(state, project.responsableId)
  const lider = usuarioPorId(state, project.liderId)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="gestion-kicker">{project.folio} · {area?.nombre?.toUpperCase() ?? ''}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{project.nombre}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{project.descripcion}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge estado={project.estado} />
          <PriorityBadge prioridad={project.prioridad} />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {estaAtrasado(project) ? <Alert tone="error" title="Proyecto atrasado">La fecha estimada de entrega ya pasó.</Alert> : null}
        {estaBloqueado(project) ? <Alert tone="warning" title="Proyecto bloqueado">{project.motivoBloqueo ?? 'Existe un impedimento activo.'}</Alert> : null}
        {estaProximoAVencer(project) ? <Alert tone="warning" title="Próximo a vencer">La entrega está programada en menos de 7 días.</Alert> : null}
      </div>

      <section className="gestion-panel mb-5 p-6">
        <div className="grid items-center gap-8 lg:grid-cols-[140px_1fr_260px]">
          <div className="progress-ring" style={{ '--progress': `${project.avance * 3.6}deg` } as React.CSSProperties}>
            <span>
              <b>{project.avance}%</b>
              <small>AVANCE</small>
            </span>
          </div>
          <div>
            <ProgressBar avance={project.avance} bloqueado={project.bloqueado} />
            <p className="mt-2 text-xs text-slate-500">Última actualización: {new Date(project.ultimaActualizacion).toLocaleString('es-MX')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><p className="gestion-kicker">RESPONSABLE</p><b className="mt-1 block">{responsable?.nombre ?? '—'}</b></div>
            <div><p className="gestion-kicker">LÍDER</p><b className="mt-1 block">{lider?.nombre ?? '—'}</b></div>
            <div><p className="gestion-kicker">INICIO</p><b className="mt-1 block">{new Date(project.fechaInicio).toLocaleDateString('es-MX')}</b></div>
            <div><p className="gestion-kicker">ENTREGA ESTIMADA</p><b className="mt-1 block">{new Date(project.fechaFinEstimada).toLocaleDateString('es-MX')}</b></div>
          </div>
        </div>
      </section>

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setParams({ tab: t.id })}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${tab === t.id ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' ? <ResumenTab project={project} esGestorDelArea={esGestorDelArea} /> : null}
      {tab === 'seguimiento' ? <SeguimientoTab project={project} /> : null}
      {tab === 'evidencias' ? <EvidenciasTab project={project} esGestorDelArea={esGestorDelArea} /> : null}
      {tab === 'historial' ? <HistorialTab project={project} /> : null}
    </div>
  )
}
