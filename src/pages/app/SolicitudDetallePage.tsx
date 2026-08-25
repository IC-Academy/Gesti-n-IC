import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Ban, Mail, Phone, User2, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { solicitudesService } from '../../services/solicitudesService'
import { usuariosService } from '../../services/usuariosService'
import type { Prioridad, Solicitud, Usuario } from '../../types'
import { PRIORIDAD_LABEL, TIEMPO_APROXIMADO_LABEL } from '../../types'
import { can } from '../../lib/permissions'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EstatusSolicitudBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useToast } from '../../context/ToastContext'
import { formatFecha, formatFechaHora } from '../../lib/format'

type Decision = 'AUTORIZADA' | 'RECHAZADA' | 'CANCELADA'

export function SolicitudDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { usuario, rolEfectivo } = useAuth()
  const navigate = useNavigate()
  const { notificar } = useToast()

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [responsables, setResponsables] = useState<Usuario[]>([])

  const [dictamen, setDictamen] = useState('')
  const [decisionPendiente, setDecisionPendiente] = useState<Decision | null>(null)
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const [nombreProyecto, setNombreProyecto] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA')
  const [responsableId, setResponsableId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFinPlaneada, setFechaFinPlaneada] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    let activo = true
    solicitudesService.obtener(id, rolEfectivo ?? undefined).then((res) => {
      if (!activo) return
      if (res.ok) {
        setSolicitud(res.data)
        setNombreProyecto(res.data.descripcion.slice(0, 60))
        setUbicacion(res.data.area)
      } else setError(res.error.message)
    })
    usuariosService.listarSeleccionables(rolEfectivo ?? undefined).then((res) => {
      if (activo && res.ok) setResponsables(res.data.filter((u) => u.rol === 'JEFE_MANTENIMIENTO'))
    })
    return () => {
      activo = false
    }
  }, [id, rolEfectivo])

  const puedeDecidir = can(rolEfectivo, 'solicitudes.decidir')
  const pendienteDeDecision = solicitud && (solicitud.estatus === 'RECIBIDA' || solicitud.estatus === 'EN_REVISION')

  const validarAutorizacion = (): boolean => {
    const nuevos: Record<string, string> = {}
    if (!nombreProyecto.trim()) nuevos.nombreProyecto = 'Indica el nombre del proyecto.'
    if (!fechaInicio) nuevos.fechaInicio = 'Selecciona la fecha inicial.'
    if (!fechaFinPlaneada) nuevos.fechaFinPlaneada = 'Selecciona la fecha final estimada.'
    if (fechaInicio && fechaFinPlaneada && fechaFinPlaneada < fechaInicio) nuevos.fechaFinPlaneada = 'Debe ser posterior a la fecha inicial.'
    if (!ubicacion.trim()) nuevos.ubicacion = 'Indica la ubicación.'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const confirmarDecision = async () => {
    if (!solicitud || !usuario || !decisionPendiente) return
    const decision = decisionPendiente
    if (!dictamen.trim()) {
      setErrores((e) => ({ ...e, dictamen: 'El dictamen es obligatorio.' }))
      setConfirmacionAbierta(false)
      return
    }
    if (decision === 'AUTORIZADA' && !validarAutorizacion()) {
      setConfirmacionAbierta(false)
      return
    }

    setEnviando(true)
    const resultado = await solicitudesService.decidir(solicitud.id, rolEfectivo ?? undefined, {
      decision,
      dictamen,
      actorId: usuario.id,
      actorNombre: usuario.nombre,
      proyecto:
        decision === 'AUTORIZADA'
          ? {
              nombre: nombreProyecto,
              prioridad,
              responsableId: responsableId || undefined,
              fechaInicio,
              fechaFinPlaneada,
              ubicacion,
              presupuestoEstimado: presupuesto ? Number(presupuesto) : undefined,
            }
          : undefined,
    })
    setEnviando(false)
    setConfirmacionAbierta(false)
    setDecisionPendiente(null)

    if (!resultado.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo registrar la decisión', descripcion: resultado.error.message })
      return
    }
    setSolicitud(resultado.data)
    notificar({
      tipo: 'exito',
      titulo:
        decision === 'AUTORIZADA' ? 'Solicitud autorizada y proyecto creado' : decision === 'RECHAZADA' ? 'Solicitud rechazada' : 'Solicitud cancelada',
    })
    if (decision === 'AUTORIZADA' && resultado.data.proyectoId) {
      navigate(`/app/proyectos/${resultado.data.proyectoId}`)
    }
  }

  const abrirConfirmacion = (decision: Decision) => {
    if (!dictamen.trim()) {
      setErrores((e) => ({ ...e, dictamen: 'El dictamen es obligatorio.' }))
      return
    }
    if (decision === 'AUTORIZADA' && !validarAutorizacion()) return
    setDecisionPendiente(decision)
    setConfirmacionAbierta(true)
  }

  if (error) return <ErrorState description={error} />
  if (!solicitud) return <LoadingState label="Cargando solicitud…" />

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ic-blue-700">Solicitud {solicitud.folio}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ic-ink">{solicitud.nombreCompleto}</h1>
        </div>
        <div className="flex gap-2">
          <EstatusSolicitudBadge estatus={solicitud.estatus} />
          {solicitud.prioridad && <PrioridadBadge prioridad={solicitud.prioridad} />}
        </div>
      </div>

      <Card>
        <CardHeader title="Detalle de la solicitud" />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <User2 className="mt-0.5 h-4 w-4 text-ic-slate" />
              <div>
                <dt className="text-xs text-ic-slate">Área</dt>
                <dd className="text-sm font-medium text-ic-ink">{solicitud.area}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-ic-slate" />
              <div>
                <dt className="text-xs text-ic-slate">Tiempo aproximado</dt>
                <dd className="text-sm font-medium text-ic-ink">{TIEMPO_APROXIMADO_LABEL[solicitud.tiempoAproximado]}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-ic-slate" />
              <div>
                <dt className="text-xs text-ic-slate">Correo</dt>
                <dd className="text-sm font-medium text-ic-ink">{solicitud.correo}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-ic-slate" />
              <div>
                <dt className="text-xs text-ic-slate">Teléfono</dt>
                <dd className="text-sm font-medium text-ic-ink">{solicitud.telefono}</dd>
              </div>
            </div>
          </dl>
          <div className="mt-5">
            <p className="text-xs text-ic-slate">Descripción</p>
            <p className="mt-1 text-sm leading-relaxed text-ic-ink">{solicitud.descripcion}</p>
          </div>
          <p className="mt-4 text-xs text-ic-slate">Registrada el {formatFechaHora(solicitud.creadoEn)}</p>
        </CardBody>
      </Card>

      {solicitud.dictamen && (
        <Card>
          <CardHeader title="Dictamen emitido" />
          <CardBody>
            <p className="text-sm leading-relaxed text-ic-ink">{solicitud.dictamen}</p>
            {solicitud.decididoEn && <p className="mt-2 text-xs text-ic-slate">Decidido el {formatFechaHora(solicitud.decididoEn)}</p>}
          </CardBody>
        </Card>
      )}

      {puedeDecidir && pendienteDeDecision && (
        <Card>
          <CardHeader title="Registrar dictamen o resultado" description="Esta acción no se puede deshacer." />
          <CardBody>
            <Textarea
              label="Comentario o dictamen"
              required
              placeholder="Explica el motivo de la decisión."
              value={dictamen}
              onChange={(e) => setDictamen(e.target.value)}
              error={errores.dictamen}
            />

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setDecisionPendiente('AUTORIZADA')}>
                <CheckCircle2 className="h-4 w-4" /> Autorizar
              </Button>
              <Button variant="danger" onClick={() => abrirConfirmacion('RECHAZADA')}>
                <XCircle className="h-4 w-4" /> Rechazar
              </Button>
              <Button variant="outline" onClick={() => abrirConfirmacion('CANCELADA')}>
                <Ban className="h-4 w-4" /> Cancelar
              </Button>
            </div>

            {decisionPendiente === 'AUTORIZADA' && (
              <div className="mt-6 rounded-xl border border-ic-line bg-ic-blue-50/40 p-5">
                <p className="mb-4 text-sm font-semibold text-ic-ink">Datos del proyecto a crear</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nombre del proyecto"
                    required
                    value={nombreProyecto}
                    onChange={(e) => setNombreProyecto(e.target.value)}
                    error={errores.nombreProyecto}
                    className="sm:col-span-2"
                  />
                  <Select label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
                    {Object.entries(PRIORIDAD_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                  <Select label="Responsable" value={responsableId} onChange={(e) => setResponsableId(e.target.value)} hint="Jefe de mantenimiento">
                    <option value="">Sin asignar todavía</option>
                    {responsables.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </Select>
                  <Input label="Fecha inicial" type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} error={errores.fechaInicio} />
                  <Input
                    label="Fecha final estimada"
                    type="date"
                    required
                    value={fechaFinPlaneada}
                    onChange={(e) => setFechaFinPlaneada(e.target.value)}
                    error={errores.fechaFinPlaneada}
                  />
                  <Input label="Ubicación" required value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} error={errores.ubicacion} />
                  <Input
                    label="Presupuesto estimado (opcional)"
                    type="number"
                    min={0}
                    placeholder="MXN"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(e.target.value)}
                  />
                </div>
                <div className="mt-5 flex justify-end">
                  <Button variant="primary" onClick={() => abrirConfirmacion('AUTORIZADA')}>
                    <CheckCircle2 className="h-4 w-4" /> Continuar con autorización
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={confirmacionAbierta}
        title={
          decisionPendiente === 'AUTORIZADA'
            ? 'Confirmar autorización'
            : decisionPendiente === 'RECHAZADA'
              ? 'Confirmar rechazo'
              : 'Confirmar cancelación'
        }
        description={
          decisionPendiente === 'AUTORIZADA'
            ? 'Se autorizará la solicitud y se creará un nuevo proyecto con los datos capturados.'
            : 'Esta decisión se enviará al solicitante y no podrá modificarse después.'
        }
        tono={decisionPendiente === 'RECHAZADA' ? 'danger' : 'primary'}
        confirmLabel="Enviar dictamen o resultado"
        loading={enviando}
        onConfirm={() => void confirmarDecision()}
        onCancel={() => setConfirmacionAbierta(false)}
      />

      {solicitud.proyectoId && (
        <div>
          <Button variant="outline" onClick={() => navigate(`/app/proyectos/${solicitud.proyectoId}`)}>
            Ver proyecto generado
          </Button>
        </div>
      )}

      <p className="text-xs text-ic-slate">Última actualización: {formatFecha(solicitud.actualizadoEn)}</p>
    </div>
  )
}
