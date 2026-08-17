import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock3, FolderKanban, Inbox, Lock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import {
  proyectosDeArea,
  proyectosDeUsuario,
  calcularKpis,
  distribucionPorArea,
  distribucionPorEstado,
  solicitudesDeArea,
  usuarioPorId,
  areaPorId,
  avancesDeProyecto,
} from '@/lib/demoSelectors'
import { KpiRow } from '@/components/gestion/KpiRow'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { ProgressBar } from '@/components/gestion/ProgressBar'
import { EmptyState } from '@/components/States'
import { ROLE_LABELS } from '@/lib/catalog'
import type { Project } from '@/lib/types'

export function Dashboard() {
  const { user } = useSession()
  const state = useDemoStore()
  const nav = useNavigate()

  const proyectos: Project[] = useMemo(() => {
    if (!user) return []
    if (user.rol === 'usuario') return proyectosDeUsuario(state, user.id)
    if (user.rol === 'lider') return proyectosDeArea(state, user.areaId)
    return state.projects
  }, [state, user])

  const solicitudesVisibles = useMemo(() => {
    if (!user) return []
    if (user.rol === 'usuario') return []
    if (user.rol === 'lider') return solicitudesDeArea(state, areaPorId(state, user.areaId)?.nombre ?? '')
    return state.requests
  }, [state, user])

  if (!user) return null

  const kpis = calcularKpis(proyectos, solicitudesVisibles)
  const prioritarios = [...proyectos]
    .filter((p) => p.estado !== 'Finalizada' && p.estado !== 'Cancelada')
    .sort((a, b) => (a.bloqueado === b.bloqueado ? b.avance - a.avance : a.bloqueado ? -1 : 1))
    .slice(0, 5)

  const actividad = proyectos
    .flatMap((p) => avancesDeProyecto(state, p.id).slice(0, 1).map((a) => ({ ...a, proyecto: p.nombre })))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)

  const decisionesPendientes = solicitudesVisibles.filter((r) => ['Solicitud recibida', 'En revisión', 'Requiere ajustes', 'Aprobada', 'Pendiente de asignación'].includes(r.estado)).length
  const areasSinLider = user.rol === 'admin' ? state.areas.filter((a) => a.activa && !a.liderId) : []

  const saludo =
    user.rol === 'admin'
      ? 'Portafolio corporativo'
      : user.rol === 'lider'
        ? `Hola, ${user.nombre.split(' ')[0]}. Tu equipo requiere atención.`
        : `Hola, ${user.nombre.split(' ')[0]}. Estos son tus proyectos.`

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="gestion-kicker">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{saludo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.rol === 'usuario' ? 'Da seguimiento a tus asignaciones y mantén la evidencia al día.' : 'Decisiones, avance y riesgos de las iniciativas de largo plazo.'}
          </p>
        </div>
        <button className="gestion-secondary" onClick={() => nav('/portal/nueva-solicitud')}>＋ Solicitar proyecto</button>
      </div>

      <KpiRow
        items={
          user.rol === 'usuario'
            ? [
                { icon: FolderKanban, value: kpis.activos, label: 'PROYECTOS ACTIVOS', tone: 0 },
                { icon: Clock3, value: kpis.atrasados + kpis.bloqueados, label: 'REQUIEREN ATENCIÓN', tone: 1 },
                { icon: TrendingUp, value: `${kpis.avancePromedio}%`, label: 'AVANCE PROMEDIO', tone: 2 },
                { icon: AlertTriangle, value: kpis.proximosAVencer, label: 'PRÓXIMOS A VENCER', tone: 3 },
              ]
            : [
                { icon: FolderKanban, value: kpis.activos, label: 'PROYECTOS ACTIVOS', tone: 0 },
                { icon: Inbox, value: kpis.solicitudesPendientes, label: 'SOLICITUDES PENDIENTES', tone: 1 },
                { icon: TrendingUp, value: `${kpis.avancePromedio}%`, label: 'AVANCE PROMEDIO', tone: 2 },
                { icon: Lock, value: kpis.bloqueados, label: 'BLOQUEADOS', tone: 3 },
              ]
        }
      />

      {areasSinLider.length ? (
        <div className="mt-1 mb-4 flex justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <span><b>{areasSinLider.length} área(s) sin líder asignado:</b> <small className="ml-2 text-amber-700">{areasSinLider.map((a) => a.nombre).join(', ')}</small></span>
          <button onClick={() => nav('/admin/areas')} className="font-semibold text-amber-700">Asignar líder →</button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_.9fr]">
        <section className="gestion-panel">
          <div className="gestion-panel-head">
            <div><b>Proyectos prioritarios</b><small>Iniciativas con actividad reciente o riesgo</small></div>
            <button onClick={() => nav('/proyectos')}>Ver portafolio →</button>
          </div>
          {prioritarios.length === 0 ? (
            <EmptyState label="No hay proyectos activos por mostrar." />
          ) : (
            prioritarios.map((p) => {
              const area = areaPorId(state, p.areaId)
              return (
                <div key={p.id} className="gestion-project-row cursor-pointer" onClick={() => nav(`/proyectos/${p.id}`)}>
                  <span className="project-mark pm0">{area?.nombre.slice(0, 2).toUpperCase() ?? '—'}</span>
                  <div>
                    <b>{p.nombre}</b>
                    <small>{p.folio} · {area?.nombre}</small>
                    <div className="mt-2"><ProgressBar avance={p.avance} bloqueado={p.bloqueado} size="sm" /></div>
                  </div>
                  <strong>{p.avance}%</strong>
                  <StatusBadge estado={p.estado} />
                  <small><b className="block">ENTREGA</b>{new Date(p.fechaFinEstimada).toLocaleDateString('es-MX')}</small>
                </div>
              )
            })
          )}
        </section>
        <section className="gestion-panel">
          <div className="gestion-panel-head"><div><b>Actividad reciente</b><small>Últimos movimientos del portafolio</small></div></div>
          <div className="space-y-5 p-5">
            {actividad.length === 0 ? (
              <p className="text-xs text-slate-400">Sin actividad reciente.</p>
            ) : (
              actividad.map((a) => {
                const autor = usuarioPorId(state, a.autorId)
                return (
                  <div className="flex gap-3" key={a.id}>
                    <span className="avatar-mini">{autor?.avatarIniciales ?? '—'}</span>
                    <p className="text-xs text-slate-600">
                      <b>{autor?.nombre ?? 'Usuario'}</b> registró {a.avance}% en {a.proyecto}
                      <small className="block text-[10px] text-slate-400">{new Date(a.fecha).toLocaleString('es-MX')}</small>
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {user.rol !== 'usuario' && decisionesPendientes > 0 ? (
        <div className="mt-4 flex justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <span><b>{decisionesPendientes} decisión(es) esperan tu revisión</b><small className="ml-3 text-amber-700">Solicitudes pendientes de dictamen o asignación.</small></span>
          <button onClick={() => nav('/solicitudes')} className="font-semibold text-amber-700">Revisar pendientes →</button>
        </div>
      ) : null}

      {user.rol === 'admin' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="gestion-panel p-5">
            <p className="gestion-kicker mb-3">DISTRIBUCIÓN POR ESTADO</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribucionPorEstado(proyectos)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="estado" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
          <section className="gestion-panel p-5">
            <p className="gestion-kicker mb-3">DISTRIBUCIÓN POR ÁREA</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribucionPorArea(state, proyectos)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="area" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>
      ) : null}

      <p className="mt-6 text-[10px] text-slate-400">Rol actual: {ROLE_LABELS[user.rol]} — los datos mostrados se filtran automáticamente según tu rol y área.</p>
    </div>
  )
}
