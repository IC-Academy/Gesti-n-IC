import { Check, X } from 'lucide-react'
import { permisosDeRol, type Permission } from '@/lib/permissions'
import { ROLE_LABELS } from '@/lib/catalog'
import { Alert } from '@/components/gestion/Alert'
import type { Role } from '@/lib/types'

const TODOS_LOS_PERMISOS: { permiso: Permission; etiqueta: string; categoria: string }[] = [
  { permiso: 'projects:view_own', etiqueta: 'Ver proyectos propios', categoria: 'Proyectos' },
  { permiso: 'projects:track_progress', etiqueta: 'Registrar avance', categoria: 'Proyectos' },
  { permiso: 'projects:comment', etiqueta: 'Comentar', categoria: 'Proyectos' },
  { permiso: 'evidence:upload', etiqueta: 'Cargar evidencias', categoria: 'Proyectos' },
  { permiso: 'evidence:view_own', etiqueta: 'Consultar historial de evidencias', categoria: 'Proyectos' },
  { permiso: 'requests:view_area', etiqueta: 'Ver solicitudes del área', categoria: 'Solicitudes' },
  { permiso: 'requests:decide', etiqueta: 'Aprobar / rechazar / pedir ajustes', categoria: 'Solicitudes' },
  { permiso: 'requests:return_for_changes', etiqueta: 'Devolver seguimiento con observaciones', categoria: 'Solicitudes' },
  { permiso: 'projects:assign', etiqueta: 'Asignar proyectos', categoria: 'Asignación' },
  { permiso: 'projects:reassign', etiqueta: 'Reasignar responsables', categoria: 'Asignación' },
  { permiso: 'projects:set_dates_priority', etiqueta: 'Definir fechas y prioridad', categoria: 'Asignación' },
  { permiso: 'evidence:validate', etiqueta: 'Validar / rechazar evidencias', categoria: 'Validación' },
  { permiso: 'projects:change_status', etiqueta: 'Cambiar estado operativo', categoria: 'Validación' },
  { permiso: 'team:view_workload', etiqueta: 'Ver carga de trabajo', categoria: 'Equipo' },
  { permiso: 'alerts:view_area', etiqueta: 'Ver alertas del área', categoria: 'Equipo' },
  { permiso: 'indicators:view_area', etiqueta: 'Ver indicadores de área', categoria: 'Equipo' },
  { permiso: 'projects:view_all', etiqueta: 'Ver todos los proyectos', categoria: 'Administración' },
  { permiso: 'requests:view_all', etiqueta: 'Ver todas las solicitudes', categoria: 'Administración' },
  { permiso: 'users:manage', etiqueta: 'Administrar usuarios', categoria: 'Administración' },
  { permiso: 'users:assign_role', etiqueta: 'Asignar roles', categoria: 'Administración' },
  { permiso: 'users:change_area', etiqueta: 'Cambiar usuarios de área', categoria: 'Administración' },
  { permiso: 'areas:manage', etiqueta: 'Administrar áreas', categoria: 'Administración' },
  { permiso: 'areas:assign_leader', etiqueta: 'Asignar líderes', categoria: 'Administración' },
  { permiso: 'projects:reassign_any', etiqueta: 'Reasignar cualquier proyecto', categoria: 'Administración' },
  { permiso: 'audit:view', etiqueta: 'Consultar auditoría', categoria: 'Administración' },
  { permiso: 'catalogs:manage', etiqueta: 'Administrar catálogos', categoria: 'Administración' },
  { permiso: 'indicators:view_global', etiqueta: 'Ver indicadores globales', categoria: 'Administración' },
]

const ROLES: Role[] = ['usuario', 'lider', 'admin']

export function RolesPermisos() {
  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">GOBIERNO DEL PORTAL</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Roles y permisos</h1>
        <p className="text-sm text-slate-500">Matriz de lo que puede hacer cada rol en Gestión IC.</p>
      </div>

      <Alert tone="warning" title="Recordatorio de seguridad">
        Esta matriz controla qué se muestra en la interfaz. Cuando el módulo se conecte a un backend real, cada
        acción de escritura debe volver a validarse del lado del servidor — nunca confiar solo en lo que oculta el
        frontend.
      </Alert>
      <div className="mt-4"><Alert tone="info" title="Vista de solo lectura">La matriz es informativa en esta versión. La administración de permisos requiere persistencia y validación del lado servidor.</Alert></div>

      <section className="gestion-panel mt-4 overflow-auto">
        <table className="gestion-table">
          <thead>
            <tr>
              <th>PERMISO</th>
              {ROLES.map((r) => <th key={r} className="text-center">{ROLE_LABELS[r]}</th>)}
            </tr>
          </thead>
          <tbody>
            {TODOS_LOS_PERMISOS.map((p) => (
              <tr key={p.permiso}>
                <td>
                  <b>{p.etiqueta}</b>
                  <small>{p.categoria}</small>
                </td>
                {ROLES.map((r) => (
                  <td key={r} className="text-center">
                    {permisosDeRol(r).includes(p.permiso) ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <X className="mx-auto h-4 w-4 text-slate-300" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
