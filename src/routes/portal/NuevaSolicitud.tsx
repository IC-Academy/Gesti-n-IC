import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Copy } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { EvidenceUploader } from '@/components/gestion/EvidenceUploader'
import { ModeTag } from '@/components/gestion/ModeTag'
import { actualizarSincronizacionSolicitud, crearSolicitud } from '@/lib/demoStore'
import { notificarSolicitudAN8n } from '@/lib/projectsApi'
import { DURACION_MINIMA_DIAS, PRIORITIES, duracionValida } from '@/lib/catalog'
import type { EvidenceRef } from '@/lib/types'

const schema = z
  .object({
    nombreSolicitante: z.string().min(1, 'Obligatorio'),
    correoSolicitante: z.string().email('Correo inválido'),
    areaSolicitante: z.string().min(1, 'Obligatorio'),
    inmueble: z.string().min(1, 'Selecciona o captura el inmueble.'),
    ubicacionEspecifica: z.string().min(3, 'Indica el espacio exacto afectado.'),
    tipoMantenimiento: z.enum(['Preventivo', 'Correctivo', 'Adecuación', 'Emergencia']),
    especialidad: z.string().min(1, 'Selecciona la especialidad.'),
    impactoOperativo: z.string().min(5, 'Describe el impacto en la operación.'),
    nombreProyecto: z.string().min(1, 'Obligatorio'),
    descripcion: z.string().min(10, 'Describe brevemente el proyecto (mínimo 10 caracteres).'),
    problemaONecesidad: z.string().min(10, 'Obligatorio'),
    objetivo: z.string().min(10, 'Obligatorio'),
    beneficioEsperado: z.string().min(5, 'Obligatorio'),
    fechaInicioDeseada: z.string().min(1, 'Obligatorio'),
    fechaTerminoEstimada: z.string().min(1, 'Obligatorio'),
    prioridad: z.enum(['Baja', 'Media', 'Alta', 'Crítica'], { message: 'Selecciona una prioridad' }),
    areaResponsableSugerida: z.string().min(1, 'Obligatorio'),
    comentariosAdicionales: z.string().optional(),
  })
  .refine((v) => new Date(v.fechaTerminoEstimada) > new Date(v.fechaInicioDeseada), {
    message: 'La fecha de término debe ser posterior a la fecha de inicio.',
    path: ['fechaTerminoEstimada'],
  })
  .refine((v) => duracionValida(v.fechaInicioDeseada, v.fechaTerminoEstimada), {
    message: `Gestión IC solo administra proyectos con duración mayor a ${DURACION_MINIMA_DIAS} días. Ajusta las fechas.`,
    path: ['fechaTerminoEstimada'],
  })

type FormValues = z.infer<typeof schema>

const AREAS_SUGERIDAS = ['Mantenimiento General', 'Climatización y Equipos', 'Obra Civil y Adecuaciones', 'Administración de Inmuebles']
const INMUEBLES = ['Corporativo CDMX', 'CEDIS Norte', 'CEDIS Poniente', 'Base Toluca', 'Base Sur', 'Base Oriente', 'Sede Centro', 'Otro']
const ESPECIALIDADES = ['Electricidad', 'Plomería', 'Climatización / HVAC', 'Obra civil', 'Impermeabilización', 'Pintura y acabados', 'Mobiliario', 'Seguridad física', 'Otra']

export function NuevaSolicitud() {
  const [archivos, setArchivos] = useState<EvidenceRef[]>([])
  const [folio, setFolio] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<{ status: 'local' | 'synced' | 'error'; message: string } | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const req = crearSolicitud({ ...values, archivosIniciales: archivos })
    actualizarSincronizacionSolicitud(req.id, 'pending', 'Intentando sincronizar con n8n.')
    const result = await notificarSolicitudAN8n(req)
    actualizarSincronizacionSolicitud(req.id, result.status, result.message)
    setSyncResult(result)
    setFolio(req.folio)
    reset()
    setArchivos([])
  }

  if (folio) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900">Solicitud recibida</h2>
            <p className="text-sm text-slate-600">
              Guarda tu folio: podrás consultar el estatus de tu solicitud en cualquier momento desde{' '}
              <b>"Consultar estatus"</b> usando este folio y el correo que registraste.
            </p>
            <div className="w-full rounded-md bg-slate-50 p-4 text-left text-sm">
              <p className="flex items-center justify-between">
                <span>
                  <span className="font-medium">Folio:</span> <span className="font-mono">{folio}</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(folio)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-700"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </button>
              </p>
              <p className="mt-2">
                <span className="font-medium">Estado inicial:</span> Solicitud recibida
              </p>
            </div>
            {syncResult?.status === 'synced' ? <Alert tone="success">{syncResult.message}</Alert> : null}
            {syncResult?.status === 'local' ? <Alert tone="info">{syncResult.message}</Alert> : null}
            {syncResult?.status === 'error' ? <Alert tone="warning">{syncResult.message} Conserva el folio para reintentar después.</Alert> : null}
            <Button onClick={() => { setFolio(null); setSyncResult(null) }}>Registrar otra solicitud</Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="gestion-kicker">PORTAL DE MANTENIMIENTO</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Reportar necesidad de mantenimiento</h1>
          <p className="text-sm text-slate-500">Registra una intervención mayor para un inmueble o instalación.</p>
        </div>
        <ModeTag mode="demo" />
      </div>

      <Alert tone="info" title="Alcance de Gestión IC">
        Esta primera fase administra intervenciones con duración estimada mayor a {DURACION_MINIMA_DIAS} días. Los trabajos
        menores continuarán por el proceso operativo vigente.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-6">
        <Card>
          <CardHeader title="Solicitante e inmueble" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre del solicitante" required error={errors.nombreSolicitante?.message}>
              <input className={inputClass(!!errors.nombreSolicitante)} {...register('nombreSolicitante')} />
            </Field>
            <Field label="Correo" required error={errors.correoSolicitante?.message}>
              <input type="email" className={inputClass(!!errors.correoSolicitante)} {...register('correoSolicitante')} />
            </Field>
            <Field label="Área solicitante" required error={errors.areaSolicitante?.message}>
              <input className={inputClass(!!errors.areaSolicitante)} {...register('areaSolicitante')} />
            </Field>
            <Field label="Inmueble o sede" required error={errors.inmueble?.message}>
              <select className={inputClass(!!errors.inmueble)} defaultValue="" {...register('inmueble')}>
                <option value="" disabled>Selecciona una opción</option>
                {INMUEBLES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Ubicación exacta" required hint="Piso, oficina, almacén, sanitario, cuarto técnico, etc." error={errors.ubicacionEspecifica?.message}>
              <input className={inputClass(!!errors.ubicacionEspecifica)} {...register('ubicacionEspecifica')} />
            </Field>
            <Field label="Tipo de mantenimiento" required error={errors.tipoMantenimiento?.message}>
              <select className={inputClass(!!errors.tipoMantenimiento)} defaultValue="" {...register('tipoMantenimiento')}>
                <option value="" disabled>Selecciona una opción</option>
                {['Preventivo', 'Correctivo', 'Adecuación', 'Emergencia'].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Especialidad" required error={errors.especialidad?.message}>
              <select className={inputClass(!!errors.especialidad)} defaultValue="" {...register('especialidad')}>
                <option value="" disabled>Selecciona una opción</option>
                {ESPECIALIDADES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Área responsable sugerida" required hint="¿Qué área crees que debería ejecutar el proyecto?" error={errors.areaResponsableSugerida?.message}>
              <select className={inputClass(!!errors.areaResponsableSugerida)} defaultValue="" {...register('areaResponsableSugerida')}>
                <option value="" disabled>Selecciona una opción</option>
                {AREAS_SUGERIDAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Descripción de la necesidad" />
          <CardBody className="grid grid-cols-1 gap-4">
            <Field label="Título de la intervención" required error={errors.nombreProyecto?.message}>
              <input className={inputClass(!!errors.nombreProyecto)} {...register('nombreProyecto')} />
            </Field>
            <Field label="Descripción" required error={errors.descripcion?.message}>
              <textarea rows={3} className={inputClass(!!errors.descripcion)} {...register('descripcion')} />
            </Field>
            <Field label="Problema o necesidad" required error={errors.problemaONecesidad?.message}>
              <textarea rows={3} className={inputClass(!!errors.problemaONecesidad)} {...register('problemaONecesidad')} />
            </Field>
            <Field label="Impacto en la operación" required error={errors.impactoOperativo?.message}>
              <textarea rows={2} className={inputClass(!!errors.impactoOperativo)} {...register('impactoOperativo')} />
            </Field>
            <Field label="Objetivo" required error={errors.objetivo?.message}>
              <textarea rows={3} className={inputClass(!!errors.objetivo)} {...register('objetivo')} />
            </Field>
            <Field label="Beneficio esperado" required error={errors.beneficioEsperado?.message}>
              <textarea rows={2} className={inputClass(!!errors.beneficioEsperado)} {...register('beneficioEsperado')} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fechas y prioridad" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha deseada de inicio" required error={errors.fechaInicioDeseada?.message}>
              <input type="date" className={inputClass(!!errors.fechaInicioDeseada)} {...register('fechaInicioDeseada')} />
            </Field>
            <Field label="Fecha estimada de término" required hint={`Debe superar los ${DURACION_MINIMA_DIAS} días desde el inicio.`} error={errors.fechaTerminoEstimada?.message}>
              <input type="date" className={inputClass(!!errors.fechaTerminoEstimada)} {...register('fechaTerminoEstimada')} />
            </Field>
            <Field label="Prioridad" required error={errors.prioridad?.message}>
              <select className={inputClass(!!errors.prioridad)} defaultValue="" {...register('prioridad')}>
                <option value="" disabled>Selecciona una opción</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Evidencias y comentarios" subtitle="Opcional · En esta demo los archivos no se cargan a un servidor" />
          <CardBody className="space-y-4">
            <Field label="Archivos o evidencias iniciales">
              <EvidenceUploader value={archivos} onChange={setArchivos} />
            </Field>
            <Field label="Comentarios adicionales">
              <textarea rows={2} className={inputClass()} {...register('comentariosAdicionales')} />
            </Field>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Registrar solicitud
          </Button>
        </div>
      </form>
    </div>
  )
}
