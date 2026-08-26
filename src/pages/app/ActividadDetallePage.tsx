import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CheckCircle2, RotateCcw, MessageSquare, FileImage, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { actividadesService } from '../../services/actividadesService'
import { proyectosService } from '../../services/proyectosService'
import { comentariosService } from '../../services/comentariosService'
import { evidenciasService } from '../../services/evidenciasService'
import { usuariosService } from '../../services/usuariosService'
import type { Actividad, Comentario, EstatusActividad, Evidencia, Prioridad, Proyecto, Usuario } from '../../types'
import { PRIORIDAD_LABEL } from '../../types'
import { can } from '../../lib/permissions'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EstatusActividadBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { FileDrop, type ArchivoSeleccionado } from '../../components/ui/FileDrop'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useToast } from '../../context/ToastContext'
import { formatFecha, formatFechaHora } from '../../lib/format'

const OPCIONES_PERSONAL: EstatusActividad[] = ['EN_PROCESO', 'BLOQUEADA', 'EN_VALIDACION']
const OPCIONES_GESTOR: EstatusActividad[] = ['PENDIENTE', 'EN_PROCESO', 'BLOQUEADA', 'EN_VALIDACION', 'COMPLETADA', 'CANCELADA']

export function ActividadDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { usuario, rolEfectivo } = useAuth()
  const navigate = useNavigate()
  const { notificar } = useToast()

  const [actividad, setActividad] = useState<Actividad | null>(null)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [personal, setPersonal] = useState<Usuario[]>([])
  const [error, setError] = useState<string | null>(null)

  const [estatus, setEstatus] = useState<EstatusActividad>('PENDIENTE')
  const [avance, setAvance] = useState(0)
  const [bloqueoMotivo, setBloqueoMotivo] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA')
  const [peso, setPeso] = useState(0)
  const [responsableId, setResponsableId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [nuevoComentario, setNuevoComentario] = useState('')
  const [archivos, setArchivos] = useState<ArchivoSeleccionado[]>([])
  const [subiendoEvidencia, setSubiendoEvidencia] = useState(false)
  const [confirmarValidacion, setConfirmarValidacion] = useState<'aprobar' | 'rechazar' | null>(null)

  const cargar = async () => {
    if (!id) return
    const res = await actividadesService.obtener(id)
    if (!res.ok) {
      setError(res.error.message)
      return
    }
    setActividad(res.data)
    setEstatus(res.data.estatus)
    setAvance(res.data.avance)
    setBloqueoMotivo(res.data.bloqueoMotivo ?? '')
    setPrioridad(res.data.prioridad)
    setPeso(res.data.peso)
    setResponsableId(res.data.responsableId ?? '')
    setFechaInicio(res.data.fechaInicio ?? '')
    setFechaFin(res.data.fechaFin ?? '')

    const rp = await proyectosService.obtener(res.data.proyectoId, rolEfectivo ?? undefined, usuario?.id)
    if (rp.ok) setProyecto(rp.data)

    const rc = await comentariosService.listarPorActividad(id)
    if (rc.ok) setComentarios(rc.data)
    const re = await evidenciasService.listarPorActividad(id)
    if (re.ok) setEvidencias(re.data)
  }

  useEffect(() => {
    cargar()
    usuariosService.listarSeleccionables(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) setPersonal(res.data.filter((u) => u.rol === 'PERSONAL_MANTENIMIENTO'))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (error) return <ErrorState description={error} />
  if (!actividad || !usuario) return <LoadingState label="Cargando actividad…" />

  const esGestor = can(rolEfectivo, 'actividades.editar_cualquiera')
  const esAsignado = actividad.responsableId === usuario.id || actividad.equipoIds.includes(usuario.id)
  const puedeAvanzar = can(rolEfectivo, 'actividades.avanzar_propia') && esAsignado
  const puedeComentar = can(rolEfectivo, 'actividades.comentar')
  const puedeCargarEvidencia = can(rolEfectivo, 'actividades.cargar_evidencia')
  const puedeValidar = can(rolEfectivo, 'actividades.validar') && actividad.estatus === 'EN_VALIDACION'

  const guardarComoGestor = async () => {
    setGuardando(true)
    const res = await actividadesService.actualizar(
      actividad.id,
      { estatus, avance, bloqueoMotivo: estatus === 'BLOQUEADA' ? bloqueoMotivo : undefined, prioridad, peso, responsableId: responsableId || undefined, fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined },
      rolEfectivo ?? undefined,
      usuario.id,
      usuario.nombre,
    )
    setGuardando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo guardar', descripcion: res.error.message })
      return
    }
    setActividad(res.data)
    notificar({ tipo: 'exito', titulo: 'Actividad actualizada' })
  }

  const guardarComoPersonal = async () => {
    if (estatus === 'BLOQUEADA' && !bloqueoMotivo.trim()) {
      notificar({ tipo: 'advertencia', titulo: 'Indica el motivo del bloqueo' })
      return
    }
    setGuardando(true)
    const res = await actividadesService.actualizar(
      actividad.id,
      { estatus, avance, bloqueoMotivo: estatus === 'BLOQUEADA' ? bloqueoMotivo : undefined },
      rolEfectivo ?? undefined,
      usuario.id,
      usuario.nombre,
    )
    setGuardando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo guardar', descripcion: res.error.message })
      return
    }
    setActividad(res.data)
    notificar({ tipo: 'exito', titulo: 'Avance registrado' })
  }

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return
    const res = await comentariosService.crear({
      texto: nuevoComentario,
      autorTipo: 'INTERNO',
      autorId: usuario.id,
      autorNombre: usuario.nombre,
      actividadId: actividad.id,
    })
    if (res.ok) {
      setComentarios((prev) => [...prev, res.data])
      setNuevoComentario('')
    }
  }

  const subirEvidencias = async () => {
    if (archivos.length === 0) return
    setSubiendoEvidencia(true)
    for (const a of archivos) {
      await evidenciasService.subir({
        nombre: a.nombre,
        url: a.url,
        tipo: a.tipo,
        actividadId: actividad.id,
        proyectoId: actividad.proyectoId,
        subidoPor: usuario.id,
        subidoPorNombre: usuario.nombre,
        visibilidad: 'SOLICITANTE',
      })
    }
    const re = await evidenciasService.listarPorActividad(actividad.id)
    if (re.ok) setEvidencias(re.data)
    setArchivos([])
    setSubiendoEvidencia(false)
    notificar({ tipo: 'exito', titulo: 'Evidencia cargada' })
  }

  const validar = async (aprobar: boolean) => {
    setGuardando(true)
    const res = await actividadesService.validar(actividad.id, rolEfectivo ?? undefined, aprobar, usuario.id, usuario.nombre)
    setGuardando(false)
    setConfirmarValidacion(null)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo validar', descripcion: res.error.message })
      return
    }
    setActividad(res.data)
    setEstatus(res.data.estatus)
    setAvance(res.data.avance)
    notificar({ tipo: 'exito', titulo: aprobar ? 'Actividad validada y completada' : 'Actividad regresada a proceso' })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {proyecto && (
        <Link to={`/app/proyectos/${proyecto.id}`} className="text-sm font-medium text-ic-blue-700 hover:underline">
          ← {proyecto.folio} — {proyecto.nombre}
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ic-blue-700">{actividad.folio}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ic-ink">{actividad.nombre}</h1>
          {actividad.descripcion && <p className="mt-2 max-w-xl text-sm text-ic-slate">{actividad.descripcion}</p>}
        </div>
        <div className="flex gap-2">
          <EstatusActividadBadge estatus={actividad.estatus} />
          <PrioridadBadge prioridad={actividad.prioridad} />
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CheckCircle2, RotateCcw, MessageSquare, FileImage, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { actividadesService } from '../../services/actividadesService'
import { proyectosService } from '../../services/proyectosService'
import { comentariosService } from '../../services/comentariosService'
import { evidenciasService } from '../../services/evidenciasService'
import { usuariosService } from '../../services/usuariosService'
import type { Actividad, Comentario, EstatusActividad, Evidencia, Prioridad, Proyecto, Usuario } from '../../types'
import { PRIORIDAD_LABEL } from '../../types'
import { can } from '../../lib/permissions'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EstatusActividadBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { FileDrop, type ArchivoSeleccionado } from '../../components/ui/FileDrop'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useToast } from '../../context/ToastContext'
import { formatFecha, formatFechaHora } from '../../lib/format'

const OPCIONES_PERSONAL: EstatusActividad[] = ['EN_PROCESO', 'BLOQUEADA', 'EN_VALIDACION']
const OPCIONES_GESTOR: EstatusActividad[] = ['PENDIENTE', 'EN_PROCESO', 'BLOQUEADA', 'EN_VALIDACION', 'COMPLETADA', 'CANCELADA']

export function ActividadDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { usuario, rolEfectivo } = useAuth()
  const navigate = useNavigate()
  const { notificar } = useToast()

  const [actividad, setActividad] = useState<Actividad | null>(null)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [personal, setPersonal] = useState<Usuario[]>([])
  const [error, setError] = useState<string | null>(null)

  const [estatus, setEstatus] = useState<EstatusActividad>('PENDIENTE')
  const [avance, setAvance] = useState(0)
  const [bloqueoMotivo, setBloqueoMotivo] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA')
  const [peso, setPeso] = useState(0)
  const [responsableId, setResponsableId] = useState('')
  const [equipoIds, setEquipoIds] = useState<string[]>([])
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [nuevoComentario, setNuevoComentario] = useState('')
  const [archivos, setArchivos] = useState<ArchivoSeleccionado[]>([])
  const [subiendoEvidencia, setSubiendoEvidencia] = useState(false)
  const [confirmarValidacion, setConfirmarValidacion] = useState<'aprobar' | 'rechazar' | null>(null)

  const cargar = async () => {
    if (!id) return
    const res = await actividadesService.obtener(id, rolEfectivo ?? undefined, usuario?.id)
    if (!res.ok) {
      setError(res.error.message)
      return
    }
    setActividad(res.data)
    setEstatus(res.data.estatus)
    setAvance(res.data.avance)
    setBloqueoMotivo(res.data.bloqueoMotivo ?? '')
    setPrioridad(res.data.prioridad)
    setPeso(res.data.peso)
    setResponsableId(res.data.responsableId ?? '')
    setEquipoIds(res.data.equipoIds)
    setFechaInicio(res.data.fechaInicio ?? '')
    setFechaFin(res.data.fechaFin ?? '')

    const rp = await proyectosService.obtener(res.data.proyectoId, rolEfectivo ?? undefined, usuario?.id)
    if (rp.ok) setProyecto(rp.data)

    const rc = await comentariosService.listarPorActividad(id)
    if (rc.ok) setComentarios(rc.data)
    const re = await evidenciasService.listarPorActividad(id)
    if (re.ok) setEvidencias(re.data)
  }

  useEffect(() => {
    cargar()
    usuariosService.listarSeleccionables(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) setPersonal(res.data.filter((u) => u.rol === 'PERSONAL_MANTENIMIENTO'))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (error) return <ErrorState description={error} />
  if (!actividad || !usuario) return <LoadingState label="Cargando actividad…" />

  const esGestor = can(rolEfectivo, 'actividades.editar_cualquiera')
  const esAsignado = actividad.responsableId === usuario.id || actividad.equipoIds.includes(usuario.id)
  const puedeAvanzar = can(rolEfectivo, 'actividades.avanzar_propia') && esAsignado
  const puedeComentar = can(rolEfectivo, 'actividades.comentar') && (esGestor || esAsignado)
  const puedeCargarEvidencia = can(rolEfectivo, 'actividades.cargar_evidencia') && (esGestor || esAsignado)
  const puedeValidar = can(rolEfectivo, 'actividades.validar') && actividad.estatus === 'EN_VALIDACION'

  const guardarComoGestor = async () => {
    setGuardando(true)
    const res = await actividadesService.actualizar(
      actividad.id,
      { estatus, avance, bloqueoMotivo: estatus === 'BLOQUEADA' ? bloqueoMotivo : undefined, prioridad, peso, responsableId: responsableId || undefined, equipoIds, fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined },
      rolEfectivo ?? undefined,
      usuario.id,
      usuario.nombre,
    )
    setGuardando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo guardar', descripcion: res.error.message })
      return
    }
    setActividad(res.data)
    notificar({ tipo: 'exito', titulo: 'Actividad actualizada' })
  }

  const guardarComoPersonal = async () => {
    if (estatus === 'BLOQUEADA' && !bloqueoMotivo.trim()) {
      notificar({ tipo: 'advertencia', titulo: 'Indica el motivo del bloqueo' })
      return
    }
    setGuardando(true)
    const res = await actividadesService.actualizar(
      actividad.id,
      { estatus, avance, bloqueoMotivo: estatus === 'BLOQUEADA' ? bloqueoMotivo : undefined },
      rolEfectivo ?? undefined,
      usuario.id,
      usuario.nombre,
    )
    setGuardando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo guardar', descripcion: res.error.message })
      return
    }
    setActividad(res.data)
    notificar({ tipo: 'exito', titulo: 'Avance registrado' })
  }

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return
    const res = await comentariosService.crear({
      texto: nuevoComentario,
      autorTipo: 'INTERNO',
      autorId: usuario.id,
      autorNombre: usuario.nombre,
      actividadId: actividad.id,
    })
    if (res.ok) {
      setComentarios((prev) => [...prev, res.data])
      setNuevoComentario('')
    }
  }

  const subirEvidencias = async () => {
    if (archivos.length === 0) return
    setSubiendoEvidencia(true)
    for (const a of archivos) {
      await evidenciasService.subir({
        nombre: a.nombre,
        url: a.url,
        tipo: a.tipo,
        actividadId: actividad.id,
        proyectoId: actividad.proyectoId,
        subidoPor: usuario.id,
        subidoPorNombre: usuario.nombre,
        visibilidad: 'SOLICITANTE',
      })
    }
    const re = await evidenciasService.listarPorActividad(actividad.id)
    if (re.ok) setEvidencias(re.data)
    setArchivos([])
    setSubiendoEvidencia(false)
    notificar({ tipo: 'exito', titulo: 'Evidencia cargada' })
  }

  const validar = async (aprobar: boolean) => {
    setGuardando(true)
    const res = await actividadesService.validar(actividad.id, rolEfectivo ?? undefined, aprobar, usuario.id, usuario.nombre)
    setGuardando(false)
    setConfirmarValidacion(null)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo validar', descripcion: res.error.message })
      return
    }
    setActividad(res.data)
    setEstatus(res.data.estatus)
    setAvance(res.data.avance)
    notificar({ tipo: 'exito', titulo: aprobar ? 'Actividad validada y completada' : 'Actividad regresada a proceso' })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {proyecto && (
        <Link to={`/app/proyectos/${proyecto.id}`} className="text-sm font-medium text-ic-blue-700 hover:underline">
          ← {proyecto.folio} — {proyecto.nombre}
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ic-blue-700">{actividad.folio}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ic-ink">{actividad.nombre}</h1>
          {actividad.descripcion && <p className="mt-2 max-w-xl text-sm text-ic-slate">{actividad.descripcion}</p>}
        </div>
        <div className="flex gap-2">
          <EstatusActividadBadge estatus={actividad.estatus} />
          <PrioridadBadge prioridad={actividad.prioridad} />
        </div>
      </div>

      {actividad.estatus === 'BLOQUEADA' && actividad.bloqueoMotivo && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Bloqueo registrado:</span> {actividad.bloqueoMotivo}
          </p>
        </div>
      )}

      {puedeValidar && (
        <Card>
          <CardHeader title="Validación pendiente" description="Esta actividad está lista para tu revisión." />
          <CardBody className="flex flex-wrap gap-3">
            <Button onClick={() => setConfirmarValidacion('aprobar')}>
              <CheckCircle2 className="h-4 w-4" /> Validar y completar
            </Button>
            <Button variant="outline" onClick={() => setConfirmarValidacion('rechazar')}>
              <RotateCcw className="h-4 w-4" /> Regresar a proceso
            </Button>
          </CardBody>
        </Card>
      )}

      {esGestor && (
        <Card>
          <CardHeader title="Editar actividad" description="Disponible para líder, jefe de mantenimiento y administrador." />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Estatus" value={estatus} onChange={(e) => setEstatus(e.target.value as EstatusActividad)}>
                {OPCIONES_GESTOR.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </Select>
              <Select label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
                {Object.entries(PRIORIDAD_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
              <Input label="Peso (%)" type="number" min={1} max={100} value={peso} onChange={(e) => setPeso(Number(e.target.value))} />
              <Input label="Avance (%)" type="number" min={0} max={100} value={avance} onChange={(e) => setAvance(Number(e.target.value))} />
              <Select label="Responsable" value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
                <option value="">Sin asignar</option>
                {personal.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
              <fieldset className="rounded-xl border border-ic-line p-3 sm:col-span-2">
                <legend className="px-1 text-sm font-medium text-ic-ink">Equipo de apoyo</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {personal.filter((p) => p.id !== responsableId).map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ic-line px-3 py-2 text-sm text-ic-ink">
                      <input
                        type="checkbox"
                        checked={equipoIds.includes(p.id)}
                        onChange={(e) => setEquipoIds((actual) => e.target.checked ? [...actual, p.id] : actual.filter((uid) => uid !== p.id))}
                      />
                      {p.nombre}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Input label="Fecha de inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              <Input label="Fecha de fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
              {estatus === 'BLOQUEADA' && (
                <Textarea
                  label="Motivo del bloqueo"
                  value={bloqueoMotivo}
                  onChange={(e) => setBloqueoMotivo(e.target.value)}
                  className="sm:col-span-2"
                  rows={2}
                />
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <Button loading={guardando} onClick={() => void guardarComoGestor()}>
                Guardar cambios
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!esGestor && puedeAvanzar && (
        <Card>
          <CardHeader title="Actualizar mi avance" />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Estatus" value={estatus} onChange={(e) => setEstatus(e.target.value as EstatusActividad)}>
                {OPCIONES_PERSONAL.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </Select>
              <Input label="Porcentaje de avance" type="number" min={0} max={100} value={avance} onChange={(e) => setAvance(Number(e.target.value))} />
              {estatus === 'BLOQUEADA' && (
                <Textarea
                  label="Motivo del bloqueo"
                  required
                  value={bloqueoMotivo}
                  onChange={(e) => setBloqueoMotivo(e.target.value)}
                  className="sm:col-span-2"
                  rows={2}
                />
              )}
            </div>
            <p className="mt-3 text-xs text-ic-slate">
              Cuando termines, cambia el estatus a <span className="font-semibold">EN_VALIDACION</span> para enviarla a revisión.
            </p>
            <div className="mt-4 flex justify-end">
              <Button loading={guardando} onClick={() => void guardarComoPersonal()}>
                Guardar avance
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Fechas" />
        <CardBody>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ic-slate">Inicio</dt>
              <dd className="font-medium text-ic-ink">{formatFecha(actividad.fechaInicio)}</dd>
            </div>
            <div>
              <dt className="text-ic-slate">Fin</dt>
              <dd className="font-medium text-ic-ink">{formatFecha(actividad.fechaFin)}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {puedeCargarEvidencia && (
        <Card>
          <CardHeader title="Evidencias" />
          <CardBody>
            {evidencias.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {evidencias.map((e) => (
                  <div key={e.id} className="flex flex-col items-center gap-2 rounded-lg border border-ic-line p-3 text-center">
                    <FileImage className="h-6 w-6 text-ic-blue-700" />
                    <p className="truncate text-xs text-ic-slate">{e.nombre}</p>
                  </div>
                ))}
              </div>
            )}
            <FileDrop archivos={archivos} onChange={setArchivos} />
            {archivos.length > 0 && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" loading={subiendoEvidencia} onClick={() => void subirEvidencias()}>
                  Cargar evidencia
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {puedeComentar && (
        <Card>
          <CardHeader title="Comentarios" />
          <CardBody>
            {comentarios.length === 0 ? (
              <p className="mb-4 text-sm text-ic-slate">Aún no hay comentarios.</p>
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
              <Input value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} placeholder="Escribe un comentario de avance…" className="flex-1" />
              <Button onClick={() => void enviarComentario()}>Enviar</Button>
            </div>
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={confirmarValidacion !== null}
        title={confirmarValidacion === 'aprobar' ? 'Validar actividad' : 'Regresar a proceso'}
        description={
          confirmarValidacion === 'aprobar'
            ? 'La actividad se marcará como completada al 100%.'
            : 'La actividad regresará a estatus "en proceso" para continuar su trabajo.'
        }
        confirmLabel={confirmarValidacion === 'aprobar' ? 'Validar' : 'Regresar'}
        loading={guardando}
        onConfirm={() => void validar(confirmarValidacion === 'aprobar')}
        onCancel={() => setConfirmarValidacion(null)}
      />

      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </div>
  )
}
        </div>
      </div>

      {actividad.estatus === 'BLOQUEADA' && actividad.bloqueoMotivo && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Bloqueo registrado:</span> {actividad.bloqueoMotivo}
          </p>
        </div>
      )}

      {puedeValidar && (
        <Card>
          <CardHeader title="Validación pendiente" description="Esta actividad está lista para tu revisión." />
          <CardBody className="flex flex-wrap gap-3">
            <Button onClick={() => setConfirmarValidacion('aprobar')}>
              <CheckCircle2 className="h-4 w-4" /> Validar y completar
            </Button>
            <Button variant="outline" onClick={() => setConfirmarValidacion('rechazar')}>
              <RotateCcw className="h-4 w-4" /> Regresar a proceso
            </Button>
          </CardBody>
        </Card>
      )}

      {esGestor && (
        <Card>
          <CardHeader title="Editar actividad" description="Disponible para líder, jefe de mantenimiento y administrador." />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Estatus" value={estatus} onChange={(e) => setEstatus(e.target.value as EstatusActividad)}>
                {OPCIONES_GESTOR.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </Select>
              <Select label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
                {Object.entries(PRIORIDAD_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
              <Input label="Peso (%)" type="number" min={1} max={100} value={peso} onChange={(e) => setPeso(Number(e.target.value))} />
              <Input label="Avance (%)" type="number" min={0} max={100} value={avance} onChange={(e) => setAvance(Number(e.target.value))} />
              <Select label="Responsable" value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
                <option value="">Sin asignar</option>
                {personal.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
              <div />
              <Input label="Fecha de inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              <Input label="Fecha de fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
              {estatus === 'BLOQUEADA' && (
                <Textarea
                  label="Motivo del bloqueo"
                  value={bloqueoMotivo}
                  onChange={(e) => setBloqueoMotivo(e.target.value)}
                  className="sm:col-span-2"
                  rows={2}
                />
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <Button loading={guardando} onClick={() => void guardarComoGestor()}>
                Guardar cambios
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!esGestor && puedeAvanzar && (
        <Card>
          <CardHeader title="Actualizar mi avance" />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Estatus" value={estatus} onChange={(e) => setEstatus(e.target.value as EstatusActividad)}>
                {OPCIONES_PERSONAL.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </Select>
              <Input label="Porcentaje de avance" type="number" min={0} max={100} value={avance} onChange={(e) => setAvance(Number(e.target.value))} />
              {estatus === 'BLOQUEADA' && (
                <Textarea
                  label="Motivo del bloqueo"
                  required
                  value={bloqueoMotivo}
                  onChange={(e) => setBloqueoMotivo(e.target.value)}
                  className="sm:col-span-2"
                  rows={2}
                />
              )}
            </div>
            <p className="mt-3 text-xs text-ic-slate">
              Cuando termines, cambia el estatus a <span className="font-semibold">EN_VALIDACION</span> para enviarla a revisión.
            </p>
            <div className="mt-4 flex justify-end">
              <Button loading={guardando} onClick={() => void guardarComoPersonal()}>
                Guardar avance
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Fechas" />
        <CardBody>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ic-slate">Inicio</dt>
              <dd className="font-medium text-ic-ink">{formatFecha(actividad.fechaInicio)}</dd>
            </div>
            <div>
              <dt className="text-ic-slate">Fin</dt>
              <dd className="font-medium text-ic-ink">{formatFecha(actividad.fechaFin)}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {puedeCargarEvidencia && (
        <Card>
          <CardHeader title="Evidencias" />
          <CardBody>
            {evidencias.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {evidencias.map((e) => (
                  <div key={e.id} className="flex flex-col items-center gap-2 rounded-lg border border-ic-line p-3 text-center">
                    <FileImage className="h-6 w-6 text-ic-blue-700" />
                    <p className="truncate text-xs text-ic-slate">{e.nombre}</p>
                  </div>
                ))}
              </div>
            )}
            <FileDrop archivos={archivos} onChange={setArchivos} />
            {archivos.length > 0 && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" loading={subiendoEvidencia} onClick={() => void subirEvidencias()}>
                  Cargar evidencia
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {puedeComentar && (
        <Card>
          <CardHeader title="Comentarios" />
          <CardBody>
            {comentarios.length === 0 ? (
              <p className="mb-4 text-sm text-ic-slate">Aún no hay comentarios.</p>
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
              <Input value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} placeholder="Escribe un comentario de avance…" className="flex-1" />
              <Button onClick={() => void enviarComentario()}>Enviar</Button>
            </div>
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={confirmarValidacion !== null}
        title={confirmarValidacion === 'aprobar' ? 'Validar actividad' : 'Regresar a proceso'}
        description={
          confirmarValidacion === 'aprobar'
            ? 'La actividad se marcará como completada al 100%.'
            : 'La actividad regresará a estatus "en proceso" para continuar su trabajo.'
        }
        confirmLabel={confirmarValidacion === 'aprobar' ? 'Validar' : 'Regresar'}
        loading={guardando}
        onConfirm={() => void validar(confirmarValidacion === 'aprobar')}
        onCancel={() => setConfirmarValidacion(null)}
      />

      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </div>
  )
}
