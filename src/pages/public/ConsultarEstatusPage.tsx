import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { OtpModal } from '../../components/otp/OtpModal'
import { solicitudesService } from '../../services/solicitudesService'
import { otpService } from '../../services/otpService'
import { evidenciasService } from '../../services/evidenciasService'
import { comentariosService } from '../../services/comentariosService'
import { actividadesService } from '../../services/actividadesService'
import { proyectosService } from '../../services/proyectosService'
import { useToast } from '../../context/ToastContext'
import type { Actividad, Comentario, Evidencia, Proyecto, Solicitud } from '../../types'
import { EstatusSolicitudBadge, EstatusActividadBadge, PrioridadBadge, EstatusProyectoBadge } from '../../components/ui/Badge'
import { formatFecha, formatFechaHora, formatMoneda } from '../../lib/format'
import { LoadingState } from '../../components/ui/Feedback'
import { FileImage, MessageSquare } from 'lucide-react'

interface Resultado {
  solicitud: Solicitud
  proyecto: Proyecto | null
  actividades: Actividad[]
  evidencias: Evidencia[]
  comentarios: Comentario[]
}

export function ConsultarEstatusPage() {
  const [folio, setFolio] = useState('')
  const [correo, setCorreo] = useState('')
  const [errores, setErrores] = useState<{ folio?: string; correo?: string }>({})
  const [buscando, setBuscando] = useState(false)
  const [destinoEnmascarado, setDestinoEnmascarado] = useState('')
  const [otpAbierto, setOtpAbierto] = useState(false)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const { notificar } = useToast()

  const buscar = async () => {
    const nuevosErrores: typeof errores = {}
    if (!folio.trim()) nuevosErrores.folio = 'Ingresa tu folio.'
    if (!correo.trim()) nuevosErrores.correo = 'Ingresa el correo utilizado en la solicitud.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return

    setBuscando(true)
    const resp = await solicitudesService.iniciarConsultaEstatus({ folio, correo })
    if (!resp.ok) {
      setBuscando(false)
      notificar({ tipo: 'error', titulo: 'No encontramos tu solicitud', descripcion: resp.error.message })
      return
    }

    const otp = await otpService.solicitar(correo, 'CONSULTAR_ESTATUS', folio.trim().toUpperCase())
    setBuscando(false)
    if (!otp.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo enviar el código', descripcion: otp.error.message })
      return
    }
    setDestinoEnmascarado(otp.data.destinoEnmascarado)
    setOtpAbierto(true)
  }

  const onVerified = async () => {
    setOtpAbierto(false)
    setCargandoDetalle(true)
    const respSolicitud = await solicitudesService.obtenerEstatusPublico(folio)
    if (!respSolicitud.ok) {
      setCargandoDetalle(false)
      notificar({ tipo: 'error', titulo: 'No se pudo cargar la información', descripcion: respSolicitud.error.message })
      return
    }
    const solicitud = respSolicitud.data

    let proyecto: Proyecto | null = null
    let actividades: Actividad[] = []
    let evidencias: Evidencia[] = []

    if (solicitud.proyectoId) {
      const respProyecto = await proyectosService.obtener(solicitud.proyectoId, 'ADMIN')
      if (respProyecto.ok) proyecto = respProyecto.data
      const respActividades = await actividadesService.listarPorProyecto(solicitud.proyectoId)
      if (respActividades.ok) actividades = respActividades.data
      const respEvidencias = await evidenciasService.listarVisiblesParaSolicitante(solicitud.id, solicitud.proyectoId)
      if (respEvidencias.ok) evidencias = respEvidencias.data
    }

    const respComentarios = await comentariosService.listarSolicitanteVisibles(solicitud.id)

    setResultado({
      solicitud,
      proyecto,
      actividades,
      evidencias,
      comentarios: respComentarios.ok ? respComentarios.data : [],
    })
    setCargandoDetalle(false)
  }

  if (cargandoDetalle) {
    return <LoadingState label="Cargando el detalle de tu solicitud…" />
  }

  if (resultado) {
    const { solicitud, proyecto, actividades, evidencias, comentarios } = resultado
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ic-blue-700">Folio {solicitud.folio}</p>
            <h1 className="mt-1 text-2xl font-semibold text-ic-ink">{solicitud.descripcion.slice(0, 72)}{solicitud.descripcion.length > 72 ? '…' : ''}</h1>
          </div>
          <div className="flex gap-2">
            <EstatusSolicitudBadge estatus={solicitud.estatus} />
            {solicitud.prioridad && <PrioridadBadge prioridad={solicitud.prioridad} />}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader title="Dictamen" />
            <CardBody>
              <p className="text-sm leading-relaxed text-ic-slate">
                {solicitud.dictamen ?? 'Tu solicitud aún está en revisión. Te notificaremos en cuanto exista un dictamen.'}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Fechas" />
            <CardBody>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-ic-slate">Registrada</dt>
                  <dd className="font-medium text-ic-ink">{formatFecha(solicitud.creadoEn)}</dd>
                </div>
                <div>
                  <dt className="text-ic-slate">Última actualización</dt>
                  <dd className="font-medium text-ic-ink">{formatFecha(solicitud.actualizadoEn)}</dd>
                </div>
                {proyecto && (
                  <>
                    <div>
                      <dt className="text-ic-slate">Inicio del proyecto</dt>
                      <dd className="font-medium text-ic-ink">{formatFecha(proyecto.fechaInicio)}</dd>
                    </div>
                    <div>
                      <dt className="text-ic-slate">Fin planeado</dt>
                      <dd className="font-medium text-ic-ink">{formatFecha(proyecto.fechaFinPlaneada)}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardBody>
          </Card>
        </div>

        {proyecto && (
          <Card className="mt-6">
            <CardHeader
              title={`Proyecto ${proyecto.folio} — ${proyecto.nombre}`}
              description={proyecto.ubicacion}
              action={<EstatusProyectoBadge estatus={proyecto.estatus} />}
            />
            <CardBody>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ic-ink">Porcentaje de avance</span>
                <span className="font-semibold text-ic-blue-800">{proyecto.avance}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-ic-blue-700" style={{ width: `${proyecto.avance}%` }} />
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-ic-ink">Línea de tiempo de actividades</p>
                <ol className="flex flex-col gap-4 border-l-2 border-ic-line pl-4">
                  {actividades.map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-ic-blue-700" />
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ic-ink">{a.nombre}</p>
                        <EstatusActividadBadge estatus={a.estatus} />
                      </div>
                      <p className="text-xs text-ic-slate">
                        {formatFecha(a.fechaInicio)} — {formatFecha(a.fechaFin)} · {a.avance}% de avance
                      </p>
                    </li>
                  ))}
                  {actividades.length === 0 && <p className="text-sm text-ic-slate">Aún no se han registrado actividades.</p>}
                </ol>
              </div>
            </CardBody>
          </Card>
        )}

        {evidencias.length > 0 && (
          <Card className="mt-6">
            <CardHeader title="Evidencias" description="Fotografías y archivos compartidos por el equipo." />
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {evidencias.map((e) => (
                  <div key={e.id} className="flex flex-col items-center gap-2 rounded-lg border border-ic-line p-3 text-center">
                    <FileImage className="h-6 w-6 text-ic-blue-700" aria-hidden="true" />
                    <p className="truncate text-xs text-ic-slate">{e.nombre}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader title="Comentarios" description="Comunicación compartida con el solicitante." />
          <CardBody>
            {comentarios.length === 0 ? (
              <p className="text-sm text-ic-slate">Aún no hay comentarios para tu solicitud.</p>
            ) : (
              <ul className="flex flex-col gap-4">
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
          </CardBody>
        </Card>

        {proyecto?.presupuestoEstimado !== undefined && (
          <p className="mt-6 text-sm text-ic-slate">
            Presupuesto estimado del proyecto: <span className="font-medium text-ic-ink">{formatMoneda(proyecto.presupuestoEstimado)}</span>
          </p>
        )}

        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => {
              setResultado(null)
              setFolio('')
              setCorreo('')
            }}
          >
            Consultar otro folio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ic-ink">Consultar estatus</h1>
        <p className="mt-2 text-ic-slate">Ingresa tu folio y el correo con el que registraste tu solicitud.</p>
      </div>

      <Card>
        <CardBody>
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              void buscar()
            }}
            noValidate
          >
            <Input
              label="Folio"
              required
              placeholder="SOL-2026-0001"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              error={errores.folio}
            />
            <Input
              label="Correo utilizado en la solicitud"
              type="email"
              required
              placeholder="solicitante@intercon.com.mx"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={errores.correo}
            />
            <Button type="submit" size="lg" loading={buscando} fullWidth>
              <Search className="h-4 w-4" /> Consultar
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-xs text-ic-slate">
        Demo sugerida: folio <span className="font-semibold text-ic-ink">SOL-2026-0001</span> con correo{' '}
        <span className="font-semibold text-ic-ink">solicitante@intercon.com.mx</span>
      </p>

      <OtpModal
        open={otpAbierto}
        destino={correo}
        destinoEnmascarado={destinoEnmascarado}
        proposito="CONSULTAR_ESTATUS"
        referenciaId={folio.trim().toUpperCase()}
        onClose={() => setOtpAbierto(false)}
        onVerified={() => void onVerified()}
      />
    </div>
  )
}
