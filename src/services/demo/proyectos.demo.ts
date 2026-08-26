import type { EstatusProyecto, Prioridad, Proyecto, Rol, ServiceResult } from '../../types'
import { can } from '../../lib/permissions'
import { delay, getDb, mutateDb, newId, nextFolioProyecto, nowIso } from './db'
import { registrarBitacora } from './bitacora'

function visibles(db: ReturnType<typeof getDb>, rol: Rol | undefined, usuarioId?: string): Proyecto[] {
  if (can(rol, 'proyectos.ver_todos')) return [...db.proyectos]
  if (can(rol, 'proyectos.ver_asignados') && usuarioId) {
    return db.proyectos.filter((p) => p.responsableId === usuarioId)
  }
  return []
}

async function listar(rol: Rol | undefined, usuarioId?: string): Promise<ServiceResult<Proyecto[]>> {
  const db = getDb()
  const data = visibles(db, rol, usuarioId).sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1))
  return delay({ ok: true, data })
}

async function obtener(id: string, rol: Rol | undefined, usuarioId?: string): Promise<ServiceResult<Proyecto>> {
  const db = getDb()
  const proyecto = db.proyectos.find((p) => p.id === id)
  if (!proyecto) return delay({ ok: false, error: { code: 'NO_ENCONTRADO', message: 'Proyecto no encontrado.' } })
  const permitido = visibles(db, rol, usuarioId).some((p) => p.id === id)
  if (!permitido) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes acceso a este proyecto.' } })
  }
  return delay({ ok: true, data: proyecto })
}

export interface NuevoProyectoInput {
  nombre: string
  prioridad: Prioridad
  responsableId?: string
  fechaInicio: string
  fechaFinPlaneada: string
  ubicacion: string
  presupuestoEstimado?: number
}

async function crear(
  input: NuevoProyectoInput,
  rol: Rol | undefined,
  actorId: string,
  actorNombre: string,
): Promise<ServiceResult<Proyecto>> {
  if (!can(rol, 'proyectos.crear')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para crear proyectos.' } })
  }
  const proyecto = mutateDb((db) => {
    const folio = nextFolioProyecto(db)
    const p: Proyecto = {
      id: newId('pry'),
      folio,
      nombre: input.nombre.trim(),
      estatus: 'PLANEACION',
import type { EstatusProyecto, Prioridad, Proyecto, Rol, ServiceResult } from '../../types'
import { can } from '../../lib/permissions'
import { delay, getDb, mutateDb, newId, nextFolioProyecto, nowIso } from './db'
import { registrarBitacora } from './bitacora'

function visibles(db: ReturnType<typeof getDb>, rol: Rol | undefined, usuarioId?: string): Proyecto[] {
  if (can(rol, 'proyectos.ver_todos')) return [...db.proyectos]
  if (can(rol, 'proyectos.ver_asignados') && usuarioId) {
    return db.proyectos.filter((p) => p.responsableId === usuarioId)
  }
  return []
}

async function listar(rol: Rol | undefined, usuarioId?: string): Promise<ServiceResult<Proyecto[]>> {
  const db = getDb()
  const data = visibles(db, rol, usuarioId).sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1))
  return delay({ ok: true, data })
}

async function obtener(id: string, rol: Rol | undefined, usuarioId?: string): Promise<ServiceResult<Proyecto>> {
  const db = getDb()
  const proyecto = db.proyectos.find((p) => p.id === id)
  if (!proyecto) return delay({ ok: false, error: { code: 'NO_ENCONTRADO', message: 'Proyecto no encontrado.' } })
  const participaEnActividad = Boolean(
    usuarioId && db.actividades.some((a) => a.proyectoId === id && (a.responsableId === usuarioId || a.equipoIds.includes(usuarioId))),
  )
  const permitido = visibles(db, rol, usuarioId).some((p) => p.id === id) || participaEnActividad
  if (!permitido) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes acceso a este proyecto.' } })
  }
  return delay({ ok: true, data: proyecto })
}

export interface NuevoProyectoInput {
  nombre: string
  prioridad: Prioridad
  responsableId?: string
  fechaInicio: string
  fechaFinPlaneada: string
  ubicacion: string
  presupuestoEstimado?: number
}

async function crear(
  input: NuevoProyectoInput,
  rol: Rol | undefined,
  actorId: string,
  actorNombre: string,
): Promise<ServiceResult<Proyecto>> {
  if (!can(rol, 'proyectos.crear')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para crear proyectos.' } })
  }
  const proyecto = mutateDb((db) => {
    const folio = nextFolioProyecto(db)
    const p: Proyecto = {
      id: newId('pry'),
      folio,
      nombre: input.nombre.trim(),
      estatus: 'PLANEACION',
      prioridad: input.prioridad,
      responsableId: input.responsableId,
      fechaInicio: input.fechaInicio,
      fechaFinPlaneada: input.fechaFinPlaneada,
      avance: 0,
      presupuestoEstimado: input.presupuestoEstimado,
      ubicacion: input.ubicacion.trim(),
      creadoPor: actorId,
      creadoEn: nowIso(),
      actualizadoEn: nowIso(),
    }
    db.proyectos.push(p)
    return p
  })

  registrarBitacora({
    actorId,
    actorNombre,
    accion: 'PROYECTO_CREADO',
    detalle: `Se creó el proyecto ${proyecto.folio} — ${proyecto.nombre}.`,
    entidad: 'proyecto',
    entidadId: proyecto.id,
  })

  return delay({ ok: true, data: proyecto })
}

export interface ActualizarProyectoInput {
  nombre?: string
  estatus?: EstatusProyecto
  prioridad?: Prioridad
  responsableId?: string
  fechaInicio?: string
  fechaFinPlaneada?: string
  fechaFinReal?: string
  presupuestoEstimado?: number
  ubicacion?: string
}

async function actualizar(id: string, patch: ActualizarProyectoInput, rol: Rol | undefined): Promise<ServiceResult<Proyecto>> {
  if (!can(rol, 'proyectos.editar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para editar proyectos.' } })
  }
  const db = getDb()
  if (!db.proyectos.some((p) => p.id === id)) {
    return delay({ ok: false, error: { code: 'NO_ENCONTRADO', message: 'Proyecto no encontrado.' } })
  }
  const actualizado = mutateDb((db) => {
    const p = db.proyectos.find((p) => p.id === id)!
    Object.assign(p, patch, { actualizadoEn: nowIso() })
    return { ...p }
  })
  return delay({ ok: true, data: actualizado })
}

export const proyectosDemo = { listar, obtener, crear, actualizar }
      prioridad: input.prioridad,
      responsableId: input.responsableId,
      fechaInicio: input.fechaInicio,
      fechaFinPlaneada: input.fechaFinPlaneada,
      avance: 0,
      presupuestoEstimado: input.presupuestoEstimado,
      ubicacion: input.ubicacion.trim(),
      creadoPor: actorId,
      creadoEn: nowIso(),
      actualizadoEn: nowIso(),
    }
    db.proyectos.push(p)
    return p
  })

  registrarBitacora({
    actorId,
    actorNombre,
    accion: 'PROYECTO_CREADO',
    detalle: `Se creó el proyecto ${proyecto.folio} — ${proyecto.nombre}.`,
    entidad: 'proyecto',
    entidadId: proyecto.id,
  })

  return delay({ ok: true, data: proyecto })
}

export interface ActualizarProyectoInput {
  nombre?: string
  estatus?: EstatusProyecto
  prioridad?: Prioridad
  responsableId?: string
  fechaInicio?: string
  fechaFinPlaneada?: string
  fechaFinReal?: string
  presupuestoEstimado?: number
  ubicacion?: string
}

async function actualizar(id: string, patch: ActualizarProyectoInput, rol: Rol | undefined): Promise<ServiceResult<Proyecto>> {
  if (!can(rol, 'proyectos.editar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para editar proyectos.' } })
  }
  const db = getDb()
  if (!db.proyectos.some((p) => p.id === id)) {
    return delay({ ok: false, error: { code: 'NO_ENCONTRADO', message: 'Proyecto no encontrado.' } })
  }
  const actualizado = mutateDb((db) => {
    const p = db.proyectos.find((p) => p.id === id)!
    Object.assign(p, patch, { actualizadoEn: nowIso() })
    return { ...p }
  })
  return delay({ ok: true, data: actualizado })
}

export const proyectosDemo = { listar, obtener, crear, actualizar }
