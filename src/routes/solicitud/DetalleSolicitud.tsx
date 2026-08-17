import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, RotateCcw, Send, UserCheck, XCircle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { EmptyState } from '@/components/States'
import { useDemoStore, cambiarEstadoSolicitud, asignarProyectoDesdeSolicitud } from '@/lib/demoStore'
import { areaPorNombre, historialDeEntidad } from '@/lib/demoSelectors'
import { useSession } from '@/lib/session'
import { DURACION_MINIMA_DIAS, PRIORITIES, duracionValida } from '@/lib/catalog'
import { puedeAdministrarArea } from '@/lib/permissions'
import type { Priority } from '@/lib/types'

export function DetalleSolicitud() {
  const { id } = useParams<{ id: string }>()
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  const [comentario, setComentario] = useState('')

  const request = state.requests.find((r) => r.id === id)
  if (!user) return null
  if (!request) return <EmptyState label="No encontramos esta solicitud." />

  const areaSugerida = areaPorNombre(state, request.areaResponsableSugerida)
  const puedeGestionar = user.rol === 'admin' || (user.rol === 'lider' && areaSugerida && puedeAdministrarArea(user, areaSugerida.id))
  const proyectoCreado = request.proyectoId ? state.projects.find((p) => p.id === request.proyectoId) : undefined

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="gestion-kicker">{request.folio}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{request.nombreProyecto}</h1>
          <p className="mt-1 text-sm text-slate-500">Solicitado por {request.nombreSolicitante} · {request.correoSolicitante}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge estado={request.estado} />
          <PriorityBadge prioridad={request.prioridad} />
        </div>
      </div>

      <Card>
        <CardHeader title="Detalle de la solicitud" />
        <CardBody className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <p className="sm:col-span-2"><span className="font-medium text-slate-700">Descripción:</span> {request.descripcion}</p>
          <p className="sm:col-span-2"><span className="font-medium text-slate-700">Problema o necesidad:</span> {request.problemaONecesidad}</p>
          <p className="sm:col-span-2"><span className="font-medium text-slate-700">Objetivo:</span> {request.objetivo}</p>
          <p className="sm:col-span-2"><span className="font-medium text-slate-700">Beneficio esperado:</span> {request.beneficioEsperado}</p>
          <p><span className="font-medium text-slate-700">Área solicitante:</span> {request.areaSolicitante}</p>
          <p><span className="font-medium text-slate-700">Área responsable sugerida:</span> {request.areaResponsableSugerida}</p>
          <p><span className="font-medium text-slate-700">Fecha deseada de inicio:</span> {new Date(request.fechaInicioDeseada).toLocaleDateString('es-MX')}</p>
          <p><span className="font-medium text-slate-700">Fecha estimada de término:</span> {new Date(request.fechaTerminoEstimada).toLocaleDateString('es-MX')}</p>
          {request.comentariosAdicionales ? <p className="sm:col-span-2"><span className="font-medium text-slate-700">Comentarios adicionales:</span> {request.comentariosAdicionales}</p> : null}
          {request.archivosIniciales.length ? (
            <div className="sm:col-span-2">
              <span className="font-medium text-slate-700">Archivos adjuntos:</span>
              <ul className="mt-1 list-inside list-disc text-xs text-slate-500">
                {request.archivosIniciales.map((a, i) => <li key={i}>{a.nombreArchivo}</li>)}
              </ul>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {request.motivoRechazoOAjuste ? <Alert tone="warning" title="Observación registrada">{request.motivoRechazoOAjuste}</Alert> : null}

      {!puedeGestionar ? (
        <Alert tone="info">Solo el líder del área sugerida o administración pueden dictaminar esta solicitud.</Alert>
      ) : (
        <Card>
          <CardHeader title="Dictamen" subtitle="Registra tu decisión sobre esta solicitud." />
          <CardBody className="space-y-4">
            {request.estado === 'Solicitud recibida' ? (
              <Button onClick={() => cambiarEstadoSolicitud(request.id, 'En revisión', user.id)}>Iniciar revisión</Button>
            ) : null}

            {request.estado === 'En revisión' || request.estado === 'Requiere ajustes' ? (
              <div className="space-y-3">
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentario u observación (obligatorio para rechazar o pedir ajustes)"
                  rows={2}
                  className="w-full rounded-md border border-slate-300 p-3 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => cambiarEstadoSolicitud(request.id, 'Aprobada', user.id, comentario || 'Aprobada.')}>
                    Aprobar
                  </Button>
                  <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} disabled={!comentario.trim()} onClick={() => cambiarEstadoSolicitud(request.id, 'Requiere ajustes', user.id, comentario)}>
                    Solicitar ajustes
                  </Button>
                  <Button variant="danger" icon={<XCircle className="h-4 w-4" />} disabled={!comentario.trim()} onClick={() => cambiarEstadoSolicitud(request.id, 'Rechazada', user.id, comentario)}>
                    Rechazar
                  </Button>
                </div>
              </div>
            ) : null}

            {request.estado === 'Aprobada' ? (
              <Button icon={<Send className="h-4 w-4" />} onClick={() => cambiarEstadoSolicitud(request.id, 'Pendiente de asignación', user.id)}>
                Enviar a asignación
              </Button>
            ) : null}

            {request.estado === 'Pendiente de asignación' ? <FormularioAsignacion requestId={request.id} /> : null}

            {request.estado === 'Asignada' && proyectoCreado ? (
              <Alert tone="success" title="Solicitud asignada">
                Ya se creó el proyecto <b>{proyectoCreado.folio}</b>.{' '}
                <button className="font-semibold text-emerald-800 underline" onClick={() => nav(`/proyectos/${proyectoCreado.id}`)}>
                  Ver proyecto →
                </button>
              </Alert>
            ) : null}

            {request.estado === 'Rechazada' || request.estado === 'Cancelada' ? <p className="text-sm text-slate-500">Esta solicitud ya se cerró y no admite más acciones.</p> : null}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Historial de estatus" />
        <CardBody>
          <ol className="space-y-2 border-l-2 border-slate-100 pl-4">
            {historialDeEntidad(state, 'ProjectRequest', request.id).map((h) => (
              <li key={h.id} className="text-xs text-slate-600">
                <b className="text-slate-800">{h.estadoNuevo}</b> · {new Date(h.fecha).toLocaleString('es-MX')}
                {h.comentario ? <span className="block text-slate-500">{h.comentario}</span> : null}
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  )
}

function FormularioAsignacion({ requestId }: { requestId: string }) {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  const request = state.requests.find((r) => r.id === requestId)
  const areaSugerida = request ? areaPorNombre(state, request.areaResponsableSugerida) : undefined
  const usuariosArea = areaSugerida ? state.users.filter((u) => u.areaId === areaSugerida.id && u.activo) : []

  const [responsableId, setResponsableId] = useState(usuariosArea[0]?.id ?? '')
  const [equipoIds, setEquipoIds] = useState<string[]>([])
  const [fechaInicio, setFechaInicio] = useState(request?.fechaInicioDeseada.slice(0, 10) ?? '')
  const [fechaFin, setFechaFin] = useState(request?.fechaTerminoEstimada.slice(0, 10) ?? '')
  const [prioridad, setPrioridad] = useState<Priority>(request?.prioridad ?? 'Media')
  const [error, setError] = useState<string | null>(null)

  if (!request || !user || !areaSugerida) return <Alert tone="warning">No se encontró el área responsable sugerida en el catálogo de áreas; créala primero desde Administración.</Alert>

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><UserCheck className="h-4 w-4 text-blue-600" /> Asignar responsable y equipo</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">Responsable</label>
          <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs">
            {usuariosArea.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Prioridad</label>
          <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as Priority)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Fecha de inicio</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Fecha fin estimada</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600">Equipo (colaboradores adicionales)</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {usuariosArea.filter((u) => u.id !== responsableId).map((u) => (
            <label key={u.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px]">
              <input
                type="checkbox"
                checked={equipoIds.includes(u.id)}
                onChange={(e) => setEquipoIds((prev) => (e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)))}
              />
              {u.nombre}
            </label>
          ))}
        </div>
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
      <Button
        icon={<CheckCircle2 className="h-4 w-4" />}
        onClick={() => {
          if (!responsableId) return setError('Selecciona un responsable.')
          if (!duracionValida(fechaInicio, fechaFin)) return setError(`La duración debe ser mayor a ${DURACION_MINIMA_DIAS} días.`)
          const proyecto = asignarProyectoDesdeSolicitud({
            requestId: request.id,
            liderId: user.id,
            responsableId,
            equipoIds,
            fechaInicio: new Date(fechaInicio).toISOString(),
            fechaFinEstimada: new Date(fechaFin).toISOString(),
            prioridad,
            areaId: areaSugerida.id,
          })
          nav(`/proyectos/${proyecto.id}`)
        }}
      >
        Asignar y crear proyecto
      </Button>
    </div>
  )
}
