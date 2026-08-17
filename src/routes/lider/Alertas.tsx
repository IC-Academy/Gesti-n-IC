import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock3, Lock, TrendingDown } from 'lucide-react'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { proyectosDeArea, estaAtrasado, estaBloqueado, estaProximoAVencer, sinActualizacionReciente, usuarioPorId } from '@/lib/demoSelectors'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { EmptyState } from '@/components/States'
import type { Project } from '@/lib/types'

function Grupo({ titulo, icon: Icon, tono, proyectos, onOpen, state }: { titulo: string; icon: typeof AlertTriangle; tono: string; proyectos: Project[]; onOpen: (id: string) => void; state: ReturnType<typeof useDemoStore> }) {
  return (
    <section className="gestion-panel">
      <div className={`flex items-center gap-2 border-b border-slate-100 px-5 py-4 ${tono}`}>
        <Icon className="h-4 w-4" />
        <b className="text-sm">{titulo}</b>
        <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold">{proyectos.length}</span>
      </div>
      {proyectos.length === 0 ? (
        <p className="px-5 py-4 text-xs text-slate-400">Sin elementos en esta categoría.</p>
      ) : (
        proyectos.map((p) => {
          const responsable = usuarioPorId(state, p.responsableId)
          return (
            <div key={p.id} className="flex cursor-pointer items-center justify-between border-b border-slate-50 px-5 py-3 text-xs last:border-0 hover:bg-slate-50" onClick={() => onOpen(p.id)}>
              <div>
                <b className="text-slate-700">{p.nombre}</b>
                <p className="text-slate-400">{p.folio} · Responsable: {responsable?.nombre ?? '—'}</p>
              </div>
              <StatusBadge estado={p.estado} />
            </div>
          )
        })
      )}
    </section>
  )
}

export function Alertas() {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  if (!user) return null

  const proyectos = user.rol === 'admin' ? state.projects : proyectosDeArea(state, user.areaId)
  const atrasados = proyectos.filter((p) => estaAtrasado(p))
  const bloqueados = proyectos.filter((p) => estaBloqueado(p))
  const porVencer = proyectos.filter((p) => estaProximoAVencer(p))
  const sinActualizar = proyectos.filter((p) => sinActualizacionReciente(p))

  const abrir = (id: string) => nav(`/proyectos/${id}`)

  if (!atrasados.length && !bloqueados.length && !porVencer.length && !sinActualizar.length) {
    return <EmptyState label="No hay alertas activas en este momento. Buen trabajo." />
  }

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">SEGUIMIENTO Y RIESGO</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Alertas</h1>
        <p className="text-sm text-slate-500">Proyectos que requieren atención inmediata.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Grupo titulo="Atrasados" icon={Clock3} tono="bg-red-50 text-red-700" proyectos={atrasados} onOpen={abrir} state={state} />
        <Grupo titulo="Bloqueados" icon={Lock} tono="bg-rose-50 text-rose-700" proyectos={bloqueados} onOpen={abrir} state={state} />
        <Grupo titulo="Próximos a vencer (7 días)" icon={AlertTriangle} tono="bg-amber-50 text-amber-700" proyectos={porVencer} onOpen={abrir} state={state} />
        <Grupo titulo="Sin actualización reciente (10+ días)" icon={TrendingDown} tono="bg-slate-100 text-slate-600" proyectos={sinActualizar} onOpen={abrir} state={state} />
      </div>
    </div>
  )
}
