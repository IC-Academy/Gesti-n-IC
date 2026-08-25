import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, Copy } from 'lucide-react'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { FileDrop, type ArchivoSeleccionado } from '../../components/ui/FileDrop'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { OtpModal } from '../../components/otp/OtpModal'
import { solicitudesService, correoValido } from '../../services/solicitudesService'
import { otpService } from '../../services/otpService'
import { useToast } from '../../context/ToastContext'
import type { TiempoAproximado } from '../../types'
import { TIEMPO_APROXIMADO_LABEL } from '../../types'

interface FormState {
  nombreCompleto: string
  area: string
  correo: string
  telefono: string
  descripcion: string
  tiempoAproximado: TiempoAproximado | ''
}

const ESTADO_INICIAL: FormState = {
  nombreCompleto: '',
  area: '',
  correo: '',
  telefono: '',
  descripcion: '',
  tiempoAproximado: '',
}

export function SolicitarProyectoPage() {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [archivos, setArchivos] = useState<ArchivoSeleccionado[]>([])
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [otpAbierto, setOtpAbierto] = useState(false)
  const [solicitudId, setSolicitudId] = useState<string | null>(null)
  const [destinoEnmascarado, setDestinoEnmascarado] = useState('')
  const [folioConfirmado, setFolioConfirmado] = useState<string | null>(null)
  const { notificar } = useToast()

  const actualizar = (campo: keyof FormState, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const validar = (): boolean => {
    const nuevos: Partial<Record<keyof FormState, string>> = {}
    if (!form.nombreCompleto.trim()) nuevos.nombreCompleto = 'Indica tu nombre completo.'
    if (!form.area.trim()) nuevos.area = 'Indica tu área.'
    if (!correoValido(form.correo)) nuevos.correo = 'El correo debe terminar en @intercon.com.mx o @icsecurity.com.'
    if (!/^\d{10}$/.test(form.telefono.replace(/\D/g, ''))) nuevos.telefono = 'Ingresa un teléfono a 10 dígitos.'
    if (form.descripcion.trim().length < 20) nuevos.descripcion = 'Describe tu solicitud con al menos 20 caracteres.'
    if (!form.tiempoAproximado) nuevos.tiempoAproximado = 'Selecciona el tiempo aproximado requerido.'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const enviar = async () => {
    if (!validar()) return
    setEnviando(true)
    const resultado = await solicitudesService.iniciar({
      nombreCompleto: form.nombreCompleto,
      area: form.area,
      correo: form.correo,
      telefono: form.telefono,
      descripcion: form.descripcion,
      tiempoAproximado: form.tiempoAproximado as TiempoAproximado,
      evidenciasNombres: archivos.map((a) => a.nombre),
    })
    setEnviando(false)

    if (!resultado.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo enviar la solicitud', descripcion: resultado.error.message })
      return
    }

    const otp = await otpService.solicitar(form.correo, 'CONFIRMAR_SOLICITUD', resultado.data.solicitudId)
    if (!otp.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo enviar el código', descripcion: otp.error.message })
      return
    }

    setSolicitudId(resultado.data.solicitudId)
    setDestinoEnmascarado(otp.data.destinoEnmascarado)
    setOtpAbierto(true)
  }

  const onVerified = async () => {
    if (!solicitudId) return
    const resultado = await solicitudesService.confirmar(solicitudId)
    setOtpAbierto(false)
    if (!resultado.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo confirmar', descripcion: resultado.error.message })
      return
    }
    setFolioConfirmado(resultado.data.folio)
    notificar({ tipo: 'exito', titulo: 'Solicitud confirmada', descripcion: `Tu folio es ${resultado.data.folio}.` })
  }

  if (folioConfirmado) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-ic-ink">¡Solicitud confirmada!</h1>
        <p className="mt-3 max-w-md text-ic-slate">
          Tu solicitud fue recibida correctamente. Guarda tu folio para consultar el dictamen y avance en cualquier
          momento.
        </p>
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-ic-line bg-ic-blue-50/50 px-6 py-4">
          <ClipboardCheck className="h-5 w-5 text-ic-blue-700" aria-hidden="true" />
          <span className="text-xl font-semibold tracking-wide text-ic-blue-900">{folioConfirmado}</span>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(folioConfirmado)
              notificar({ tipo: 'info', titulo: 'Folio copiado' })
            }}
            className="rounded-md p-1.5 text-ic-blue-700 hover:bg-white focus-ring"
            aria-label="Copiar folio"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/estatus"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-ic-blue-900 px-6 text-sm font-semibold text-white hover:bg-ic-blue-800 focus-ring"
          >
            Consultar estatus
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-ic-line px-6 text-sm font-semibold text-ic-ink hover:bg-ic-blue-50 focus-ring"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ic-ink">Solicitar proyecto</h1>
        <p className="mt-2 text-ic-slate">
          Completa la información y confirma tu solicitud con el código que enviaremos a tu correo institucional.
        </p>
      </div>

      <Card>
        <CardHeader title="Datos de la solicitud" description="Todos los campos marcados con * son obligatorios." />
        <CardBody>
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              void enviar()
            }}
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Nombre completo"
                required
                value={form.nombreCompleto}
                onChange={(e) => actualizar('nombreCompleto', e.target.value)}
                error={errores.nombreCompleto}
                autoComplete="name"
              />
              <Input
                label="Área"
                required
                value={form.area}
                onChange={(e) => actualizar('area', e.target.value)}
                error={errores.area}
              />
              <Input
                label="Correo corporativo"
                type="email"
                required
                placeholder="nombre@intercon.com.mx"
                value={form.correo}
                onChange={(e) => actualizar('correo', e.target.value)}
                error={errores.correo}
                hint="Dominios válidos: @intercon.com.mx y @icsecurity.com"
                autoComplete="email"
              />
              <Input
                label="Teléfono"
                type="tel"
                required
                placeholder="10 dígitos"
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                error={errores.telefono}
                autoComplete="tel"
              />
            </div>

            <Textarea
              label="Descripción completa"
              required
              placeholder="Describe el trabajo requerido con el mayor detalle posible."
              value={form.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              error={errores.descripcion}
              rows={5}
            />

            <Select
              label="Tiempo aproximado"
              required
              value={form.tiempoAproximado}
              onChange={(e) => actualizar('tiempoAproximado', e.target.value)}
              error={errores.tiempoAproximado}
            >
              <option value="">Selecciona una opción</option>
              {Object.entries(TIEMPO_APROXIMADO_LABEL).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </Select>

            <FileDrop label="Evidencias o fotografías (opcional)" archivos={archivos} onChange={setArchivos} />

            <div className="mt-2 flex justify-end">
              <Button type="submit" size="lg" loading={enviando}>
                Enviar solicitud
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <OtpModal
        open={otpAbierto}
        destino={form.correo}
        destinoEnmascarado={destinoEnmascarado}
        proposito="CONFIRMAR_SOLICITUD"
        referenciaId={solicitudId ?? undefined}
        onClose={() => setOtpAbierto(false)}
        onVerified={() => void onVerified()}
      />
    </div>
  )
}
