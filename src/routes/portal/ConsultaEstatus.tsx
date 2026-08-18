import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { ModeTag } from '@/components/gestion/ModeTag'
import { buscarSolicitud, useDemoStore } from '@/lib/demoStore'
import { historialDeEntidad } from '@/lib/demoSelectors'
import type { ProjectRequest } from '@/lib/types'

const schema = z.object({ folio: z.string().min(1, 'Obligatorio'), correo: z.string().email('Correo inválido') })
type FormValues = z.infer<typeof schema>

export function ConsultaEstatus() {
  const state = useDemoStore()
  const [resultado, setResultado] = useState<ProjectRequest | null | undefined>(undefined)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(values: FormValues) {
    setResultado(buscarSolicitud(values.folio, values.correo) ?? null)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="gestion-kicker">PORTAL DEL SOLICITANTE</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Consultar estatus de una solicitud</h1>
          <p className="text-sm text-slate-500">Ingresa el folio y el correo con el que la registraste.</p>
        </div>
        <ModeTag mode="demo" />
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Folio" required error={errors.folio?.message}>
              <input className={inputClass(!!errors.folio)} placeholder="GIC-SOL-..." {...register('folio')} />
            </Field>
            <Field label="Correo" required error={errors.correo?.message}>
              <input type="email" className={inputClass(!!errors.correo)} {...register('correo')} />
            </Field>
            <div className="flex items-end">
              <Button type="submit" className="w-full" icon={<Search className="h-4 w-4" />}>
                Consultar
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {resultado === null ? (
        <div className="mt-4">
          <Alert tone="warning">No se encontró una solicitud con ese folio y correo. Verifica los datos e inténtalo de nuevo.</Alert>
        </div>
      ) : null}

      {resultado ? (
        <Card className="mt-4">
          <CardHeader
            title={resultado.nombreProyecto}
            subtitle={`Folio ${resultado.folio} · ${resultado.areaResponsableSugerida}`}
            action={<StatusBadge estado={resultado.estado} />}
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <p><span className="font-medium text-slate-700">Solicitante:</span> {resultado.nombreSolicitante}</p>
              <p><span className="font-medium text-slate-700">Prioridad:</span> <PriorityBadge prioridad={resultado.prioridad} /></p>
              <p><span className="font-medium text-slate-700">Fecha de solicitud:</span> {new Date(resultado.creadoEn).toLocaleDateString('es-MX')}</p>
              <p><span className="font-medium text-slate-700">Última actualización:</span> {new Date(resultado.actualizadoEn).toLocaleDateString('es-MX')}</p>
              <p><span className="font-medium text-slate-700">Fecha deseada de inicio:</span> {new Date(resultado.fechaInicioDeseada).toLocaleDateString('es-MX')}</p>
              <p><span className="font-medium text-slate-700">Fecha estimada de término:</span> {new Date(resultado.fechaTerminoEstimada).toLocaleDateString('es-MX')}</p>
            </div>
            {resultado.motivoRechazoOAjuste ? (
              <Alert tone="warning" title="Observación del equipo revisor">{resultado.motivoRechazoOAjuste}</Alert>
            ) : null}
            <Alert tone={resultado.syncStatus === 'synced' ? 'success' : resultado.syncStatus === 'error' ? 'warning' : 'info'} title="Persistencia de la solicitud">
              {resultado.syncMessage ?? (resultado.syncStatus === 'local'
                ? 'Esta solicitud existe solamente en el almacenamiento local de este navegador.'
                : `Estado de sincronización: ${resultado.syncStatus}.`)}
            </Alert>
            <div>
              <p className="gestion-kicker mb-2">HISTORIAL DE ESTATUS</p>
              <ol className="space-y-2 border-l-2 border-slate-100 pl-4">
                {historialDeEntidad(state, 'ProjectRequest', resultado.id).map((h) => (
                  <li key={h.id} className="text-xs text-slate-600">
                    <b className="text-slate-800">{h.estadoNuevo}</b> · {new Date(h.fecha).toLocaleString('es-MX')}
                    {h.comentario ? <span className="block text-slate-500">{h.comentario}</span> : null}
                  </li>
                ))}
              </ol>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
