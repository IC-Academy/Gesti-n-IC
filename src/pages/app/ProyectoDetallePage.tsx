import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, MapPin, CalendarDays, Wallet, MessageSquare, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { proyectosService } from '../../services/proyectosService'
import { actividadesService } from '../../services/actividadesService'
import { evidenciasService } from '../../services/evidenciasService'
import { comentariosService } from '../../services/comentariosService'
import { usuariosService } from '../../services/usuariosService'
import type { Actividad, Comentario, Evidencia, Prioridad, Proyecto, Usuario } from '../../types'
import { PRIORIDAD_LABEL } from '../../types'
import { can } from '../../lib/permissions'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EstatusActividadBadge, EstatusProyectoBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { GanttChart } from '../../components/gantt/GanttChart'
import { useToast } from '../../context/ToastContext'
import { formatFecha, formatFechaHora, formatMoneda, classNames } from '../../lib/format'
import { FileImage } from 'lucide-react'

const TABS = ['resumen', 'actividades', 'gantt', 'evidencias', 'comentarios'] as const
type Tab = (typeof TABS)[number]

const TAB_LABEL: Record<Tab, string> = {
  resumen: 'Resumen',
  actividades: 'Actividades',
  gantt: 'Gantt',
  evidencias: 'Evidencias',
  comentarios: 'Comentarios',
}

export function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { usuario, rolEfectivo } = useAuth()
  const navigate = useNavigate()
  const { notificar } = useToast()

  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [personal, setPersonal] = useState<Usuario[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('resumen')
  const [modalActividad, setModalActividad] = useState(false)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  const cargarTodo = () => {
    if (!id) return
    proyectosService.obtener(id, rolEfectivo ?? undefined, usuario?.id).then((res) => {
      if (res.ok) setProyecto(res.data)
      else setError(res.error.message)
    })
    actividadesService.listarPorProyecto(id).then((res) => res.ok && setActividades(res.data))
    evidenciasService.listarPorProyecto(id).then((res) => res.ok && setEvidencias(res.data))
    comentariosService.listarPorProyecto(id).then((res) => res.ok && setComentarios(res.data))
  }

  useEffect(() => {
    cargarTodo()
    usuariosService.listarSeleccionables(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) setPersonal(res.data.filter((u) => u.rol === 'PERSONAL_MANTENIMIENTO'))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rolEfectivo])

  const pesoUsado = useMemo(() => actividades.filter((a) => a.estatus !== 'CANCELADA').reduce((acc, a) => acc + a.peso, 0), [actividades])
  const puedeCrearActividad = can(rolEfectivo, 'actividades.crear')

  const enviarComentario = async () => {
    if (!usuario || !id || !nuevoComentario.trim()) return
    setEnviandoComentario(true)
    const res = await comentariosService.crear({
      texto: nuevoComentario,
      autorTipo: 'INTERNO',
      autorId: usuario.id,
      autorNombre: usuario.nombre,
      proyectoId: id,
    })
    setEnviandoComentario(false)
    if (res.ok) {
      setComentarios((prev) => [...prev, res.data])
      setNuevoComentario('')
    } else {
      notificar({ tipo: 'error', titulo: 'No se pudo enviar el comentario', descripcion: res.error.message })
    }
  }

  if (error) return <ErrorState description={error} />
  if (!proyecto) return <LoadingState label="Cargando proyecto…" />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ic-blue-700">{proyecto.folio}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ic-ink">{proyecto.nombre}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ic-slate">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {proyecto.ubicacion}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {formatFecha(proyecto.fechaInicio)} — {formatFecha(proyecto.fechaFinPlaneada)}
            </span>
            {proyecto.presupuestoEstimado !== undefined && (
              <span className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" /> {formatMoneda(proyecto.presupuestoEstimado)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <EstatusProyectoBadge estatus={proyecto.estatus} />
          <PrioridadBadge prioridad={proyecto.prioridad} />
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ic-ink">Avance general del proyecto</span>
            <span className="font-semibold text-ic-blue-800">{proyecto.avance}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-ic-blue-700 transition-all" style={{ width: `${proyecto.avance}%` }} />
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-1 overflow-x-auto border-b border-ic-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={classNames(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition',
              tab === t ? 'border-ic-blue-800 text-ic-blue-900' : 'border-transparent text-ic-slate hover:text-ic-ink',
            )}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <Card>
          <CardHeader title="Resumen del proyecto" />
          <CardBody>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-ic-slate">Actividades totales</dt>
                <dd className="text-lg font-semibold text-ic-ink">{actividades.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-ic-slate">Completadas</dt>
                <dd className="text-lg font-semibold text-ic-ink">{actividades.filter((a) => a.estatus === 'COMPLETADA').length}</dd>
              </div>
              <div>
                <dt className="text-xs text-ic-slate">Peso asignado</dt>
                <dd className="text-lg font-semibold text-ic-ink">{pesoUsado}% / 100%</dd>
              </div>
            </dl>
          </CardBody>
        </Card>
      )}

      {tab === 'actividades' && (
        <Card className="overflow-hidden p-0">
          <CardHeader
            title="Actividades"
            description={`Peso asignado: ${pesoUsado}% de 100%`}
            action={
              puedeCrearActividad && (
                <Button size="sm" onClick={() => setModalActividad(true)}>
                  <Plus className="h-4 w-4" /> Nueva actividad
                </Button>
              )
            }
          />
          {actividades.length === 0 ? (
            <EmptyState title="Sin actividades" description="Aún no se han registrado actividades para este proyecto." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ic-line text-xs uppercase tracking-wide text-ic-slate">
                  <tr>
                    <th className="px-6 py-3 font-medium">Folio</th>
                    <th className="px-6 py-3 font-medium">Nombre</th>
                    <th className="px-6 py-3 font-medium">Responsable</th>
                    <th className="px-6 py-3 font-medium">Peso</th>
                    <th className="px-6 py-3 font-medium">Avance</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((a) => (
                    <tr key={a.id} className="border-b border-ic-line last:border-b-0 hover:bg-ic-blue-50/40">
                      <td className="px-6 py-3">
                        <Link to={`/app/actividades/${a.id}`} className="font-medium text-ic-blue-800 hover:underline">
                          {a.folio}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-ic-ink">{a.nombre}</td>
                      <td className="px-6 py-3 text-ic-slate">{personal.find((p) => p.id === a.responsableId)?.nombre ?? '—'}</td>
                      <td className="px-6 py-3 text-ic-slate">{a.peso}%</td>
                      <td className="px-6 py-3 text-ic-slate">{a.avance}%</td>
                      <td className="px-6 py-3">
                        <EstatusActividadBadge estatus={a.estatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'gantt' && (
        <Card>
          <CardHeader title="Carta Gantt" description="Basada en las fechas de inicio y fin de cada actividad." />
          <CardBody>
            <GanttChart actividades={actividades} />
          </CardBody>
        </Card>
      )}

      {tab === 'evidencias' && (
        <Card>
          <CardHeader title="Evidencias del proyecto" />
          <CardBody>
            {evidencias.length === 0 ? (
              <EmptyState title="Sin evidencias" description="Las evidencias cargadas en las actividades aparecerán aquí." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {evidencias.map((e) => (
                  <div key={e.id} className="flex flex-col items-center gap-2 rounded-lg border border-ic-line p-3 text-center">
                    <FileImage className="h-6 w-6 text-ic-blue-700" />
                    <p className="truncate text-xs text-ic-slate">{e.nombre}</p>
                    <span className="text-[10px] text-ic-slate/70">{e.visibilidad === 'SOLICITANTE' ? 'Visible al solicitante' : 'Interna'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'comentarios' && (
        <Card>
          <CardHeader title="Comentarios" />
          <CardBody>
            {comentarios.length === 0 ? (
              <p className="text-sm text-ic-slate">Aún no hay comentarios en este proyecto.</p>
            ) : (
              <ul className="mb-5 flex flex-col gap-4">
                {comentarios.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ic-blue-50 text-ic-blue-700">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ic-ink">{c.autorNombre}</p>
                      <p className="text-sm text-ic-slate">{c.texto}</p>
                      <p className="mt-0.5 text-xs text-ic-slate/70">{formatFechaHora(c.creadoEn)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                label="Agregar comentario"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe una actualización para el equipo…"
                className="flex-1"
              />
              <Button className="mt-7 shrink-0" onClick={() => void enviarComentario()} loading={enviandoComentario}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {puedeCrearActividad && (
        <NuevaActividadModal
          abierto={modalActividad}
          proyectoId={proyecto.id}
          pesoDisponible={100 - pesoUsado}
          personal={personal}
          onClose={() => setModalActividad(false)}
          onCreada={(a) => {
            setActividades((prev) => [...prev, a])
            setModalActividad(false)
            notificar({ tipo: 'exito', titulo: 'Actividad creada', descripcion: `${a.folio} — ${a.nombre}` })
            proyectosService.obtener(proyecto.id, rolEfectivo ?? undefined, usuario?.id).then((res) => res.ok && setProyecto(res.data))
          }}
        />
      )}

      <div>
        <Button variant="ghost" onClick={() => navigate('/app/proyectos')}>
          Volver a proyectos
        </Button>
      </div>
    </div>
  )
}

function NuevaActividadModal({
  abierto,
  proyectoId,
  pesoDisponible,
  personal,
  onClose,
  onCreada,
}: {
  abierto: boolean
  proyectoId: string
  pesoDisponible: number
  personal: Usuario[]
  onClose: () => void
  onCreada: (a: Actividad) => void
}) {
  const { rolEfectivo } = useAuth()
  const { notificar } = useToast()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA')
  const [peso, setPeso] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [equipoIds, setEquipoIds] = useState<string[]>([])
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  const limpiar = () => {
    setNombre('')
    setDescripcion('')
    setPrioridad('MEDIA')
    setPeso('')
    setResponsableId('')
    setEquipoIds([])
    setFechaInicio('')
    setFechaFin('')
    setErrores({})
  }

  const crear = async () => {
    const nuevos: Record<string, string> = {}
    if (!nombre.trim()) nuevos.nombre = 'Indica el nombre de la actividad.'
    const pesoNum = Number(peso)
    if (!peso || Number.isNaN(pesoNum) || pesoNum <= 0) nuevos.peso = 'Indica un peso mayor a 0.'
    else if (pesoNum > pesoDisponible) nuevos.peso = `El peso no puede superar el disponible (${pesoDisponible}%).`
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    setEnviando(true)
    const res = await actividadesService.crear(
      {
        proyectoId,
        nombre,
        descripcion,
        prioridad,
        peso: pesoNum,
        responsableId: responsableId || undefined,
        equipoIds,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      },
      rolEfectivo ?? undefined,
    )
    setEnviando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo crear la actividad', descripcion: res.error.message })
      return
    }
    onCreada(res.data)
    limpiar()
  }

  return (
    <Modal open={abierto} onClose={onClose} title="Nueva actividad" description={`Peso disponible: ${pesoDisponible}%`} size="lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} className="sm:col-span-2" />
        <Textarea label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="sm:col-span-2" rows={3} />
        <Select label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
          {Object.entries(PRIORIDAD_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
        <Input
          label="Peso (%)"
          type="number"
          required
          min={1}
          max={pesoDisponible}
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          error={errores.peso}
          hint={`Disponible: ${pesoDisponible}%`}
        />
        <Select label="Responsable" value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
          <option value="">Sin asignar todavía</option>
          {personal.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Select>
        <fieldset className="rounded-xl border border-ic-line p-3 sm:col-span-2">
          <legend className="px-1 text-sm font-medium text-ic-ink">Equipo de apoyo</legend>
          <p className="mb-3 text-xs text-ic-slate">También podrán ver la actividad, registrar avance y cargar evidencia.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {personal.filter((p) => p.id !== responsableId).map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ic-line px-3 py-2 text-sm text-ic-ink">
                <input
                  type="checkbox"
                  checked={equipoIds.includes(p.id)}
                  onChange={(e) => setEquipoIds((actual) => e.target.checked ? [...actual, p.id] : actual.filter((id) => id !== p.id))}
                />
                {p.nombre}
              </label>
            ))}
          </div>
        </fieldset>
        <Input label="Fecha de inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <Input label="Fecha de fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button loading={enviando} onClick={() => void crear()}>
          Crear actividad
        </Button>
      </div>
    </Modal>
  )
}
