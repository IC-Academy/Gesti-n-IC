import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { useSession } from '@/lib/session'
import { useDemoStore, actualizarUsuario } from '@/lib/demoStore'
import { areaPorId } from '@/lib/demoSelectors'
import { ROLE_LABELS } from '@/lib/catalog'
import { permisosDeRol } from '@/lib/permissions'

const ETIQUETAS_PERMISOS: Record<string, string> = {
  'projects:view_own': 'Ver mis proyectos asignados',
  'projects:track_progress': 'Registrar avance y evidencias',
  'projects:comment': 'Agregar comentarios',
  'evidence:upload': 'Cargar evidencias',
  'evidence:view_own': 'Consultar historial de evidencias',
  'requests:view_area': 'Ver solicitudes de mi área',
  'requests:decide': 'Aprobar / rechazar / pedir ajustes',
  'requests:return_for_changes': 'Devolver seguimientos con observaciones',
  'projects:assign': 'Asignar responsables',
  'projects:reassign': 'Reasignar responsables',
  'projects:set_dates_priority': 'Definir fechas y prioridad',
  'evidence:validate': 'Validar o rechazar evidencias',
  'projects:change_status': 'Cambiar el estado operativo de proyectos',
  'team:view_workload': 'Consultar carga de trabajo del equipo',
  'alerts:view_area': 'Ver alertas de mi área',
  'indicators:view_area': 'Ver indicadores de mi área',
  'projects:view_all': 'Ver y administrar todos los proyectos',
  'requests:view_all': 'Ver todas las solicitudes',
  'users:manage': 'Crear, editar, activar y desactivar usuarios',
  'users:assign_role': 'Asignar roles',
  'users:change_area': 'Cambiar usuarios de área',
  'areas:manage': 'Crear y administrar áreas',
  'areas:assign_leader': 'Asignar líderes',
  'projects:reassign_any': 'Reasignar cualquier proyecto',
  'audit:view': 'Consultar auditoría e historial',
  'catalogs:manage': 'Administrar catálogos y configuraciones',
  'indicators:view_global': 'Ver indicadores globales',
}

export function Perfil() {
  const { user } = useSession()
  const state = useDemoStore()
  const [guardado, setGuardado] = useState(false)
  const { register, handleSubmit } = useForm<{ puesto: string }>({ defaultValues: { puesto: user?.puesto ?? '' } })
  if (!user) return null
  const area = areaPorId(state, user.areaId)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="gestion-kicker">CUENTA</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Mi perfil</h1>
        <p className="text-sm text-slate-500">Información de tu cuenta en este entorno de demostración.</p>
      </div>

      <Card>
        <CardHeader title="Datos generales" />
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="avatar-big !h-14 !w-14 !text-sm">{user.avatarIniciales}</span>
            <div>
              <b className="text-base">{user.nombre}</b>
              <p className="text-sm text-slate-500">{user.correo}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="gestion-kicker">ROL</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{ROLE_LABELS[user.rol]}</p>
            </div>
            <div>
              <p className="gestion-kicker">ÁREA</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{area?.nombre ?? 'Sin área'}</p>
            </div>
            <div>
              <p className="gestion-kicker">ALTA EN EL SISTEMA</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{new Date(user.creadoEn).toLocaleDateString('es-MX')}</p>
            </div>
          </div>
          {guardado ? <Alert tone="success">Puesto actualizado (modo demostración: cambio guardado localmente).</Alert> : null}
          <form
            onSubmit={handleSubmit((values) => {
              actualizarUsuario(user.id, { puesto: values.puesto }, user.id)
              setGuardado(true)
            })}
            className="flex items-end gap-3"
          >
            <Field label="Puesto" className="flex-1">
              <input className={inputClass()} {...register('puesto')} />
            </Field>
            <Button type="submit" icon={<Save className="h-4 w-4" />}>
              Guardar
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Qué puedes hacer con tu rol" subtitle="Los cambios de rol y permisos globales solo los administra Administración." />
        <CardBody>
          <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
            {permisosDeRol(user.rol).map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                {ETIQUETAS_PERMISOS[p] ?? p}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
