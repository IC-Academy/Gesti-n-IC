import { useState } from 'react'
import { Send } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { useDemoStore, agregarComentario, cambiarEstadoProyecto, reasignarResponsable, actualizarPlanProyecto } from '@/lib/demoStore'
import { comentariosDeProyecto, usuarioPorId } from '@/lib/demoSelectors'
import { PRIORITIES, TRANSICIONES_PERMITIDAS } from '@/lib/catalog'
import { useSession } from '@/lib/session'
import type { Priority, Project, ProjectStatus } from '@/lib/types'

export function ResumenTab({ project, esGestorDelArea }: { project: Project; esGestorDelArea: boolean }) {
  const state = useDemoStore()
  const { user } = useSession()
  const [texto, setTexto] = useState('')
  const [guardado, setGuardado] = useState(false)

  if (!user) return null

  const equipo = [project.responsableId, ...project.equipoIds].map((id) => usuarioPorId(state, id)).filter(Boolean)
  const comentarios = comentariosDeProyecto(state, project.id)
  const posiblesResponsables = state.users.filter((u) => u.areaId === project.areaId && u.activo)
  const transicionesDisponibles = TRANSICIONES_PERMITIDAS[project.estado]

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card>
        <CardHeader title="Equipo asignado" />
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {equipo.map((u, i) => (
            <div key={u!.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
              <span className="avatar-mini">{u!.avatarIniciales}</span>
              <div>
                <b className="block text-xs">{u!.nombre}</b>
                <small className="text-[10px] text-slate-400">{i === 0 ? 'Responsable' : 'Colaborador'} · {u!.puesto}</small>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Comentarios" subtitle="Visibles para todo el equipo del proyecto" />
        <CardBody className="space-y-3">
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {comentarios.length === 0 ? <p className="text-xs text-slate-400">Aún no hay comentarios.</p> : null}
            {comentarios.map((c) => {
              const autor = usuarioPorId(state, c.autorId)
              return (
                <div key={c.id} className="flex gap-2 text-xs">
                  <span className="avatar-mini shrink-0">{autor?.avatarIniciales ?? '—'}</span>
                  <div>
                    <p><b>{autor?.nombre ?? 'Usuario'}</b> <span className="text-[10px] text-slate-400">{new Date(c.creadoEn).toLocaleString('es-MX')}</span></p>
                    <p className="text-slate-600">{c.texto}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!texto.trim()) return
              agregarComentario(project.id, texto.trim(), user.id)
              setTexto('')
            }}
            className="flex gap-2"
          >
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un comentario…" className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs" />
            <Button type="submit" icon={<Send className="h-3.5 w-3.5" />}>Enviar</Button>
          </form>
        </CardBody>
      </Card>

      {esGestorDelArea ? (
        <Card className="xl:col-span-2">
          <CardHeader title="Gestión del proyecto" subtitle="Estas acciones solo están disponibles para el líder del área o administración." />
          <CardBody className="space-y-5">
            {guardado ? <Alert tone="success">Cambios guardados.</Alert> : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="gestion-kicker mb-1">RESPONSABLE</p>
                <select
                  defaultValue={project.responsableId}
                  onChange={(e) => { reasignarResponsable(project.id, e.target.value, user.id); setGuardado(true) }}
                  className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs"
                >
                  {posiblesResponsables.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="gestion-kicker mb-1">PRIORIDAD</p>
                <select
                  defaultValue={project.prioridad}
                  onChange={(e) => { actualizarPlanProyecto(project.id, { prioridad: e.target.value as Priority }, user.id); setGuardado(true) }}
                  className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="gestion-kicker mb-1">FECHA FIN ESTIMADA</p>
                <input
                  type="date"
                  defaultValue={project.fechaFinEstimada.slice(0, 10)}
                  onChange={(e) => { actualizarPlanProyecto(project.id, { fechaFinEstimada: new Date(e.target.value).toISOString() }, user.id); setGuardado(true) }}
                  className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs"
                />
              </div>
            </div>
            <div>
              <p className="gestion-kicker mb-2">CAMBIAR ESTADO OPERATIVO</p>
              {transicionesDisponibles.length === 0 ? (
                <p className="text-xs text-slate-400">Este proyecto está en un estado final; no admite más transiciones.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <StatusBadge estado={project.estado} />
                  <span className="text-xs text-slate-400">→</span>
                  {transicionesDisponibles.map((estado: ProjectStatus) => (
                    <button
                      key={estado}
                      onClick={() => { cambiarEstadoProyecto(project.id, estado, user.id, `Cambio manual realizado por ${user.nombre}.`); setGuardado(true) }}
                      className="gestion-secondary"
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
