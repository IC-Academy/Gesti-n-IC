// Consultas derivadas sobre el estado de demoStore. Son funciones puras: no
// mutan nada, solo leen y calculan (KPIs, filtros, alertas). Mantenerlas aquí
// evita repetir la misma lógica de "¿está atrasado?" en cada pantalla.

import { esEstadoFinal } from './catalog'
import type { DemoState } from './demoStore'
import type { Project, ProjectRequest, User } from './types'

const DIA_MS = 1000 * 60 * 60 * 24

export function estaAtrasado(p: Project, ahora = new Date()): boolean {
  if (esEstadoFinal(p.estado)) return false
  return new Date(p.fechaFinEstimada).getTime() < ahora.getTime()
}

export function estaProximoAVencer(p: Project, dias = 7, ahora = new Date()): boolean {
  if (esEstadoFinal(p.estado)) return false
  const restantes = (new Date(p.fechaFinEstimada).getTime() - ahora.getTime()) / DIA_MS
  return restantes >= 0 && restantes <= dias
}

export function estaBloqueado(p: Project): boolean {
  return p.estado === 'Bloqueada' || p.bloqueado
}

export function sinActualizacionReciente(p: Project, dias = 10, ahora = new Date()): boolean {
  if (esEstadoFinal(p.estado)) return false
  const desde = (ahora.getTime() - new Date(p.ultimaActualizacion).getTime()) / DIA_MS
  return desde >= dias
}

export function proyectosDeUsuario(state: DemoState, userId: string): Project[] {
  return state.projects.filter((p) => p.responsableId === userId || p.equipoIds.includes(userId))
}

export function proyectosDeArea(state: DemoState, areaId: string): Project[] {
  return state.projects.filter((p) => p.areaId === areaId)
}

export function solicitudesDeArea(state: DemoState, areaNombre: string): ProjectRequest[] {
  return state.requests.filter((r) => r.areaResponsableSugerida === areaNombre)
}

export function usuarioPorId(state: DemoState, id: string): User | undefined {
  return state.users.find((u) => u.id === id)
}

export function areaPorId(state: DemoState, id: string) {
  return state.areas.find((a) => a.id === id)
}

export function areaPorNombre(state: DemoState, nombre: string) {
  return state.areas.find((a) => a.nombre === nombre)
}

export interface Kpis {
  activos: number
  atrasados: number
  bloqueados: number
  proximosAVencer: number
  sinActualizacion: number
  avancePromedio: number
  solicitudesPendientes: number
}

export function calcularKpis(proyectos: Project[], solicitudes: ProjectRequest[]): Kpis {
  const activos = proyectos.filter((p) => !esEstadoFinal(p.estado))
  const avancePromedio = activos.length ? Math.round(activos.reduce((acc, p) => acc + p.avance, 0) / activos.length) : 0
  return {
    activos: activos.length,
    atrasados: proyectos.filter((p) => estaAtrasado(p)).length,
    bloqueados: proyectos.filter((p) => estaBloqueado(p)).length,
    proximosAVencer: proyectos.filter((p) => estaProximoAVencer(p)).length,
    sinActualizacion: proyectos.filter((p) => sinActualizacionReciente(p)).length,
    avancePromedio,
    solicitudesPendientes: solicitudes.filter((r) => ['Solicitud recibida', 'En revisión', 'Requiere ajustes', 'Aprobada', 'Pendiente de asignación'].includes(r.estado)).length,
  }
}

export interface CargaTrabajo {
  usuario: User
  proyectosActivos: number
  avancePromedio: number
  bloqueados: number
}

export function cargaDeTrabajoPorArea(state: DemoState, areaId: string): CargaTrabajo[] {
  return state.users
    .filter((u) => u.areaId === areaId && u.activo)
    .map((usuario) => {
      const propios = proyectosDeUsuario(state, usuario.id).filter((p) => !esEstadoFinal(p.estado))
      return {
        usuario,
        proyectosActivos: propios.length,
        avancePromedio: propios.length ? Math.round(propios.reduce((acc, p) => acc + p.avance, 0) / propios.length) : 0,
        bloqueados: propios.filter((p) => estaBloqueado(p)).length,
      }
    })
}

export function distribucionPorEstado(proyectos: Project[]): Array<{ estado: string; total: number }> {
  const mapa = new Map<string, number>()
  proyectos.forEach((p) => mapa.set(p.estado, (mapa.get(p.estado) ?? 0) + 1))
  return Array.from(mapa.entries()).map(([estado, total]) => ({ estado, total }))
}

export function distribucionPorArea(state: DemoState, proyectos: Project[]): Array<{ area: string; total: number }> {
  const mapa = new Map<string, number>()
  proyectos.forEach((p) => {
    const nombre = areaPorId(state, p.areaId)?.nombre ?? p.areaId
    mapa.set(nombre, (mapa.get(nombre) ?? 0) + 1)
  })
  return Array.from(mapa.entries()).map(([area, total]) => ({ area, total }))
}

export function notificacionesDeUsuario(state: DemoState, userId: string) {
  return state.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime())
}

export function historialDeEntidad(state: DemoState, entidad: 'ProjectRequest' | 'Project', entidadId: string) {
  return state.statusHistory
    .filter((h) => h.entidad === entidad && h.entidadId === entidadId)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
}

export function avancesDeProyecto(state: DemoState, projectId: string) {
  return state.progressUpdates.filter((u) => u.projectId === projectId).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export function evidenciasDeProyecto(state: DemoState, projectId: string) {
  return state.evidences.filter((e) => e.projectId === projectId).sort((a, b) => new Date(b.subidoEn).getTime() - new Date(a.subidoEn).getTime())
}

export function comentariosDeProyecto(state: DemoState, projectId: string) {
  return state.comments.filter((c) => c.projectId === projectId).sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())
}
