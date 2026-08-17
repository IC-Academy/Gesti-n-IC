import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'

const schema = z.object({ correo: z.string().email('Correo inválido') })
type FormValues = z.infer<typeof schema>

/**
 * Recuperación de acceso SIMULADA: no hay backend de autenticación en esta
 * primera versión (ver src/lib/session.tsx). Esta pantalla existe para
 * completar el flujo de UX; cuando se conecte el proveedor de identidad real,
 * este formulario se reemplaza por el flujo nativo de ese proveedor.
 */
export function RecuperarAcceso({ onVolver }: { onVolver: () => void }) {
  const [enviado, setEnviado] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <button onClick={onVolver} className="mb-4 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al acceso
        </button>
        <Card>
          <CardHeader title="Recuperar acceso" subtitle="Simulación · en producción esto lo maneja el proveedor de identidad corporativo" />
          <CardBody>
            {enviado ? (
              <Alert tone="success" title="Solicitud enviada (simulada)">
                <p className="mt-1">
                  Si el correo existiera en el directorio corporativo, recibirías instrucciones para restablecer tu
                  acceso. En este entorno de demostración no se envía ningún correo real.
                </p>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit(() => setEnviado(true))} className="space-y-4">
                <Field label="Correo corporativo" required error={errors.correo?.message}>
                  <input className={inputClass(!!errors.correo)} placeholder="nombre.apellido@iccorp-demo.mx" {...register('correo')} />
                </Field>
                <Button type="submit" className="w-full" icon={<MailCheck className="h-4 w-4" />}>
                  Enviar instrucciones
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
