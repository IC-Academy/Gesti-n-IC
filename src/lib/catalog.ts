// Catálogo centralizado de estados, prioridades y metadatos visuales del
// módulo de Gestión de Proyectos. Cambiar el flujo de estados o sus colores
// se hace en un solo lugar (aquí), no en cada pantalla.

import type { Priority, ProjectStatus, Role } from './types'

interface StatusMeta {
  orden: number
  grupo: 'solicitud' | 'ejecucion' | 'cierre'
  color: string
  descripcion: string
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Solicitud recibida',
  'En revisión',
  'Requiere ajustes',
  'Aprobada',
  'Rechazada',
  'Pendiente de asignación',
  'Asignada',
  'En planeación',
  'En ejecución',
  'Bloqueada',
  'En validación',
  'Finalizada',
  'Cancelada',
]

export const STATUS_META: Record<ProjectStatus, StatusMeta> = {
  'Solicitud recibida': { orden: 1, grupo: 'solicitud', color: 'bg-slate-100 text-slate-700 border-slate-300', descripcion: 'La solicitud llegó al portal y espera revisión.' },
  'En revisión': { orden: 2, grupo: 'solicitud', color: 'bg-blue-100 text-blue-800 border-blue-300', descripcion: 'Un líder está revisando la solicitud.' },
  'Requiere ajustes': { orden: 3, grupo: 'solicitud', color: 'bg-amber-100 text-amber-800 border-amber-300', descripcion: 'Se regresó al solicitante para precisar información.' },
  Aprobada: { orden: 4, grupo: 'solicitud', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', descripcion: 'El líder aprobó la solicitud; falta asignar responsable.' },
  Rechazada: { orden: 5, grupo: 'cierre', color: 'bg-red-100 text-red-800 border-red-300', descripcion: 'La solicitud fue rechazada.' },
  'Pendiente de asignación': { orden: 6, grupo: 'solicitud', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', descripcion: 'Aprobada; esperando asignar responsable y equipo.' },
  Asignada: { orden: 7, grupo: 'ejecucion', color: 'bg-sky-100 text-sky-800 border-sky-300', descripcion: 'Ya tiene responsable asignado.' },
  'En planeación': { orden: 8, grupo: 'ejecucion', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', descripcion: 'Se está definiendo el plan de trabajo.' },
  'En ejecución': { orden: 9, grupo: 'ejecucion', color: 'bg-blue-100 text-blue-700 border-blue-300', descripcion: 'El equipo está trabajando activamente.' },
  Bloqueada: { orden: 10, grupo: 'ejecucion', color: 'bg-rose-100 text-rose-800 border-rose-300', descripcion: 'Hay un impedimento que detiene el avance.' },
  'En validación': { orden: 11, grupo: 'ejecucion', color: 'bg-purple-100 text-purple-800 border-purple-300', descripcion: 'El líder está validando evidencias/entregables.' },
  Finalizada: { orden: 12, grupo: 'cierre', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', descripcion: 'El proyecto concluyó satisfactoriamente.' },
  Cancelada: { orden: 13, grupo: 'cierre', color: 'bg-slate-200 text-slate-600 border-slate-300', descripcion: 'El proyecto se canceló antes de finalizar.' },
}

export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_META).map(([k, v]) => [k, v.color]),
)

export const PRIORITIES: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica']

export const PRIORITY_COLORS: Record<Priority, string> = {
  Baja: 'bg-slate-100 text-slate-600 border-slate-300',
  Media: 'bg-blue-100 text-blue-700 border-blue-300',
  Alta: 'bg-orange-100 text-orange-700 border-orange-300',
  Crítica: 'bg-red-100 text-red-700 border-red-300',
}

export const ROLE_LABELS: Record<Role, string> = {
  usuario: 'Usuario',
  lider: 'Líder de área',
  admin: 'Administrador',
}

/** Estados que corresponden a una solicitud aún no convertida en proyecto. */
export const ESTADOS_SOLICITUD_PROYECTOS: ProjectStatus[] = PROJECT_STATUSES.filter(
  (s) => STATUS_META[s].grupo === 'solicitud',
)

/** Estados de un proyecto ya asignado / en ejecución. */
export const ESTADOS_EJECUCION: ProjectStatus[] = PROJECT_STATUSES.filter(
  (s) => STATUS_META[s].grupo === 'ejecucion',
)

export const ESTADOS_CIERRE: ProjectStatus[] = PROJECT_STATUSES.filter(
  (s) => STATUS_META[s].grupo === 'cierre',
)

/** Transiciones permitidas desde cada estado (para validar acciones de dictamen/operación). */
export const TRANSICIONES_PERMITIDAS: Record<ProjectStatus, ProjectStatus[]> = {
  'Solicitud recibida': ['En revisión', 'Requiere ajustes', 'Rechazada'],
  'En revisión': ['Aprobada', 'Requiere ajustes', 'Rechazada'],
  'Requiere ajustes': ['En revisión', 'Rechazada'],
  Aprobada: ['Pendiente de asignación'],
  Rechazada: [],
  'Pendiente de asignación': ['Asignada'],
  Asignada: ['En planeación', 'En ejecución'],
  'En planeación': ['En ejecución', 'Bloqueada'],
  'En ejecución': ['Bloqueada', 'En validación', 'Finalizada', 'Cancelada'],
  Bloqueada: ['En planeación', 'En ejecución', 'Cancelada'],
  'En validación': ['En ejecución', 'Finalizada'],
  Finalizada: [],
  Cancelada: [],
}

export function esEstadoFinal(estado: ProjectStatus): boolean {
  return STATUS_META[estado].grupo === 'cierre' || estado === 'Finalizada'
}

const MS_POR_DIA = 1000 * 60 * 60 * 24

export function diasEntre(fechaIso1: string, fechaIso2: string): number {
  return Math.round((new Date(fechaIso2).getTime() - new Date(fechaIso1).getTime()) / MS_POR_DIA)
}

/** Regla de negocio obligatoria: Gestión IC solo administra proyectos de más de 30 días. */
export function duracionValida(fechaInicioIso: string, fechaFinIso: string): boolean {
  if (!fechaInicioIso || !fechaFinIso) return false
  return diasEntre(fechaInicioIso, fechaFinIso) > 30
}

export const DURACION_MINIMA_DIAS = 30
