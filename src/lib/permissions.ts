import type { Rol } from '../types'

// ============================================================================
// Autorización centralizada. Toda la UI y la capa de servicios (incluso el
// repositorio demo) consultan esta función — nunca se decide un permiso
// ocultando únicamente un botón en la interfaz.
// ============================================================================

export type Accion =
  // Solicitudes
  | 'solicitudes.ver_todas'
  | 'solicitudes.revisar'
  | 'solicitudes.decidir'
  // Proyectos
  | 'proyectos.ver_todos'
  | 'proyectos.crear'
  | 'proyectos.editar'
  | 'proyectos.ver_asignados'
  // Actividades
  | 'actividades.crear'
  | 'actividades.editar_cualquiera'
  | 'actividades.asignar'
  | 'actividades.ver_propias'
  | 'actividades.avanzar_propia'
  | 'actividades.validar'
  | 'actividades.comentar'
  | 'actividades.cargar_evidencia'
  // Usuarios
  | 'usuarios.gestionar'
  | 'usuarios.cambiar_rol'
  | 'usuarios.activar_desactivar'
  // Sistema
  | 'bitacora.ver'
  | 'configuracion.administrar'
  | 'dashboard.ver'
  | 'dashboard.ver_ejecutivo'
  | 'simulacion.entrar_como_otro_rol'

const MATRIZ: Record<Rol, Accion[]> = {
  ADMIN: [
    'solicitudes.ver_todas',
    'solicitudes.revisar',
    'solicitudes.decidir',
    'proyectos.ver_todos',
    'proyectos.crear',
    'proyectos.editar',
    'proyectos.ver_asignados',
    'actividades.crear',
    'actividades.editar_cualquiera',
    'actividades.asignar',
    'actividades.comentar',
    'actividades.cargar_evidencia',
    'actividades.validar',
    'usuarios.gestionar',
    'usuarios.cambiar_rol',
    'usuarios.activar_desactivar',
    'bitacora.ver',
    'configuracion.administrar',
    'dashboard.ver',
    'dashboard.ver_ejecutivo',
    'simulacion.entrar_como_otro_rol',
  ],
  LIDER: [
    'solicitudes.ver_todas',
    'solicitudes.revisar',
    'solicitudes.decidir',
    'proyectos.ver_todos',
    'proyectos.crear',
    'proyectos.editar',
    'proyectos.ver_asignados',
    'actividades.crear',
    'actividades.editar_cualquiera',
    'actividades.asignar',
    'actividades.comentar',
    'actividades.cargar_evidencia',
    'actividades.validar',
    'dashboard.ver',
    'dashboard.ver_ejecutivo',
  ],
  JEFE_MANTENIMIENTO: [
    'proyectos.ver_asignados',
    'actividades.crear',
    'actividades.editar_cualquiera',
    'actividades.asignar',
    'actividades.comentar',
    'actividades.cargar_evidencia',
    'actividades.validar',
  ],
  PERSONAL_MANTENIMIENTO: [
    'actividades.ver_propias',
    'actividades.avanzar_propia',
    'actividades.comentar',
    'actividades.cargar_evidencia',
  ],
}

export function can(rol: Rol | undefined | null, accion: Accion): boolean {
  if (!rol) return false
  return MATRIZ[rol]?.includes(accion) ?? false
}

export function canAny(rol: Rol | undefined | null, acciones: Accion[]): boolean {
  return acciones.some((a) => can(rol, a))
}

/** Ruta de aterrizaje por rol tras iniciar sesión. */
export function homeRouteForRole(rol: Rol): string {
  switch (rol) {
    case 'ADMIN':
      return '/app/dashboard'
    case 'LIDER':
      return '/app/dashboard'
    case 'JEFE_MANTENIMIENTO':
      return '/app/proyectos'
    case 'PERSONAL_MANTENIMIENTO':
      return '/app/mis-actividades'
  }
}
