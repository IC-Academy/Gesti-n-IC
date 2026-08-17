import { ArrowRightCircle, MessageSquare, TrendingUp } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { EmptyState } from '@/components/States'
import { useDemoStore } from '@/lib/demoStore'
import { historialDeEntidad, avancesDeProyecto, comentariosDeProyecto, usuarioPorId } from '@/lib/demoSelectors'
import type { Project } from '@/lib/types'

type Evento = { fecha: string; tipo: 'estado' | 'avance' | 'comentario'; contenido: React.ReactNode }

export function HistorialTab({ project }: { project: Project }) {
  const state = useDemoStore()

  const estados = historialDeEntidad(state, 'Project', project.id).map((h) => ({
    fecha: h.fecha,
    tipo: 'estado' as const,
    contenido: (
      <span>
        <b>{usuarioPorId(state, h.usuarioId)?.nombre ?? h.usuarioId}</b> cambió el estado de <b>{h.estadoAnterior}</b> a <b>{h.estadoNuevo}</b>
        {h.comentario ? <span className="block text-slate-500">{h.comentario}</span> : null}
      </span>
    ),
  }))

  const avances = avancesDeProyecto(state, project.id).map((a) => ({
    fecha: a.fecha,
    tipo: 'avance' as const,
    contenido: (
      <span>
        <b>{usuarioPorId(state, a.autorId)?.nombre ?? a.autorId}</b> registró <b>{a.avance}%</b> de avance
        <span className="block text-slate-500">{a.resumen}</span>
      </span>
    ),
  }))

  const comentarios = comentariosDeProyecto(state, project.id).map((c) => ({
    fecha: c.creadoEn,
    tipo: 'comentario' as const,
    contenido: (
      <span>
        <b>{usuarioPorId(state, c.autorId)?.nombre ?? c.autorId}</b> comentó: <span className="text-slate-500">"{c.texto}"</span>
      </span>
    ),
  }))

  const eventos: Evento[] = [...estados, ...avances, ...comentarios].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const ICONOS = { estado: ArrowRightCircle, avance: TrendingUp, comentario: MessageSquare }
  const COLORES = { estado: 'text-blue-600 bg-blue-50', avance: 'text-emerald-600 bg-emerald-50', comentario: 'text-slate-500 bg-slate-100' }

  return (
    <Card>
      <CardHeader title="Historial completo" subtitle="Estados, avances y comentarios en orden cronológico" />
      <CardBody>
        {eventos.length === 0 ? (
          <EmptyState label="Aún no hay historial para este proyecto." />
        ) : (
          <ol className="space-y-4 border-l-2 border-slate-100 pl-5">
            {eventos.map((ev, i) => {
              const Icon = ICONOS[ev.tipo]
              return (
                <li key={i} className="relative text-xs">
                  <span className={`absolute -left-[27px] grid h-6 w-6 place-items-center rounded-full ${COLORES[ev.tipo]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-slate-700">{ev.contenido}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{new Date(ev.fecha).toLocaleString('es-MX')}</p>
                </li>
              )
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  )
}
