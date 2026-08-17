// Matriz de permisos por rol para el módulo de Gestión de Proyectos.
//
// IMPORTANTE — esto es una capa de UX, no de seguridad real: en esta primera
// versión (solo frontend estático en GitHub Pages) cualquier persona con
// herramientas de desarrollador podría alterar el estado del navegador y
// "ver" botones ocultos. Por eso:
//   1) Aquí solo OCULTAMOS/DESHABILITAMOS acciones no autorizadas en la UI.
//   2) Cuando este módulo se conecte a n8n/Airtable (o a un backend propio),
//      CADA operación de escritura (aprobar, asignar, cambiar rol, eliminar,
//      etc.) DEBE validar el rol del usuario también del lado del servidor.
//      No confiar nunca únicamente en lo que decide este archivo.

import type { Role, User } from './types'

export type Permission =
  // Usuario
  | 'projects:view_own'
  | 'projects:track_progress'
  | 'projects:comment'
  | 'evidence:upload'
  | 'evidence:view_own'
  // Líder
  | 'requests:view_area'
  | 'requests:decide'
  | 'projects:assign'
  | 'projects:reassign'
  | 'projects:set_dates_priority'
  | 'evidence:validate'
  | 'projects:change_status'
  | 'team:view_workload'
  | 'alerts:view_area'
  | 'requests:return_for_changes'
  | 'indicators:view_area'
  // Administrador
  | 'projects:view_all'
  | 'requests:view_all'
  | 'users:manage'
  | 'users:assign_role'
  | 'users:change_area'
  | 'areas:manage'
  | 'areas:assign_leader'
  | 'projects:reassign_any'
  | 'audit:view'
  | 'catalogs:manage'
  | 'indicators:view_global'
  // Explícitamente prohibidos para ciertos roles (documentado para claridad)
  | 'projects:delete'
  | 'roles:change_global'

const USUARIO_PERMS: Permission[] = [
  'projects:view_own',
  'projects:track_progress',
  'projects:comment',
  'evidence:upload',
  'evidence:view_own',
]

const LIDER_PERMS: Permission[] = [
  ...USUARIO_PERMS,
  'requests:view_area',
  'requests:decide',
  'requests:return_for_changes',
  'projects:assign',
  'projects:reassign',
  'projects:set_dates_priority',
  'evidence:validate',
  'projects:change_status',
  'team:view_workload',
  'alerts:view_area',
  'indicators:view_area',
]

const ADMIN_PERMS: Permission[] = [
  ...LIDER_PERMS,
  'projects:view_all',
  'requests:view_all',
  'users:manage',
  'users:assign_role',
  'users:change_area',
  'areas:manage',
  'areas:assign_leader',
  'projects:reassign_any',
  'audit:view',
  'catalogs:manage',
  'indicators:view_global',
]

const MATRIZ: Record<Role, Permission[]> = {
  usuario: USUARIO_PERMS,
  lider: LIDER_PERMS,
  admin: ADMIN_PERMS,
}

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return MATRIZ[role].includes(permission)
}

export function permisosDeRol(role: Role): Permission[] {
  return MATRIZ[role]
}

/**
 * Un líder solo administra su propia área salvo permiso explícito (admin).
 * Los administradores pueden operar sobre cualquier área.
 */
export function puedeAdministrarArea(user: User | null, areaId: string): boolean {
  if (!user) return false
  if (user.rol === 'admin') return true
  if (user.rol === 'lider') return user.areaId === areaId
  return false
}

/** Un usuario solo puede ver/editar proyectos donde participa como responsable o colaborador. */
export function esParticipante(userId: string, equipoIds: string[], responsableId: string): boolean {
  return userId === responsableId || equipoIds.includes(userId)
}
