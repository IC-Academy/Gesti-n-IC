import type { Actividad, EstatusActividad, Prioridad, Rol, ServiceResult } from '../../types'
import { can } from '../../lib/permissions'
import { delay, getDb, mutateDb, newId, nextFolioActividad, nowIso, type DemoDb } from './db'
import { registrarBitacora } from './bitacora'

function recalcularAvanceProyecto(db: DemoDb, proyectoId: string) {
  const proyecto = db.proyectos.find((p) => p.id === proyectoId)
  if (!proyecto) return
  const actividades = db.actividades.filter((a) => a.proyectoId === proyectoId && a.estatus !== 'CANCELADA')
  const avancePonderado = actividades.reduce((acc, a) => acc + (a.peso * a.avance) / 100, 0)
  proyecto.avance = Math.max(0, Math.min(100, Math.round(avancePonderado)))
  proyecto.actualizadoEn = nowIso()

  if (proyecto.avance >= 100 && actividades.length > 0 && actividades.every((a) => a.estatus === 'COMPLETADA')) {
    proyecto.estatus = 'COMPLETADO'
    proyecto.fechaFinReal = proyecto.fechaFinReal ?? nowIso().slice(0, 10)
  } else if (proyecto.estatus === 'PLANEACION' && actividades.some((a) => a.estatus !== 'PENDIENTE')) {
    proyecto.estatus = 'EN_PROCESO'
  }
}

function pesoDisponible(db: DemoDb, proyectoId: string, excluirActividadId?: string): number {
  const usado = db.actividades
    .filter((a) => a.proyectoId === proyectoId && a.estatus !== 'CANCELADA' && a.id !== excluirActividadId)
    .reduce((acc, a) => acc + a.peso, 0)
  return Math.max(0, 100 - usado)
}

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Actividad[]>> {
  const db = getDb()
  const data = db.actividades
    .filter((a) => a.proyectoId === proyectoId)
    .sort((a, b) => (a.folio < b.folio ? -1 : 1))
  return delay({ ok: true, data })
}

async function listarAsignadas(usuarioId: string): Promise<ServiceResult<Actividad[]>> {
  const db = getDb()
  const data = db.actividades
    .filter((a) => a.responsableId === usuarioId || a.equipoIds.includes(usuarioId))
    .sort((a, b) => (a.actualizadoEn < b.actualizadoEn ? 1 : -1))
  return delay({ ok: true, data })
}

async function obtener(id: string): Promise<ServiceResult<Actividad>> {
  const db = getDb()
  const a = db.actividades.find((a) => a.id === id)
  if (!a) return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'Actividad no encontrada.' } })
  return delay({ ok: true, data: a })
}

export interface NuevaActividadInput {
  proyectoId: string
  nombre: string
  descripcion?: string
  prioridad: Prioridad
  peso: number
  responsableId?: string
  equipoIds?: string[]
  fechaInicio?: string
  fechaFin?: string
}

async function crear(input: NuevaActividadInput, rol: Rol | undefined): Promise<ServiceResult<Actividad>> {
  if (!can(rol, 'actividades.crear')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para crear actividades.' } })
  }
  if (input.peso <= 0 || input.peso > 100) {
    return delay({ ok: false, error: { code: 'PESO_INVALIDO', message: 'El peso debe estar entre 1 y 100.' } })
  }

  const db = getDb()
  const disponible = pesoDisponible(db, input.proyectoId)
  if (input.peso > disponible) {
    return delay({
      ok: false,
      error: {
        code: 'PESO_EXCEDIDO',
        message: `El peso total de las actividades no puede superar 100%. Disponible: ${disponible}%.`,
      },
    })
  }

  const actividad = mutateDb((db) => {
    const folio = nextFolioActividad(db)
    const a: Actividad = {
      id: newId('act'),
      folio,
      proyectoId: input.proyectoId,
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim(),
      estatus: 'PENDIENTE',
      prioridad: input.prioridad,
      peso: input.peso,
      avance: 0,
      responsableId: input.responsableId,
      equipoIds: input.equipoIds ?? [],
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      creadoEn: nowIso(),
      actualizadoEn: nowIso(),
    }
    db.actividades.push(a)
    recalcularAvanceProyecto(db, input.proyectoId)
    return a
  })

  registrarBitacora({
    actorNombre: 'Sistema',
    accion: 'ACTIVIDAD_CREADA',
    detalle: `Se creó la actividad ${actividad.folio} — ${actividad.nombre}.`,
    entidad: 'actividad',
    entidadId: actividad.id,
  })

  return delay({ ok: true, data: actividad })
}

export interface ActualizarActividadInput {
  nombre?: string
  descripcion?: string
  estatus?: EstatusActividad
  prioridad?: Prioridad
  peso?: number
  avance?: number
  responsableId?: string
  equipoIds?: string[]
  fechaInicio?: string
  fechaFin?: string
  bloqueoMotivo?: string
}

const TRANSICIONES_PERSONAL: EstatusActividad[] = ['EN_PROCESO', 'BLOQUEADA', 'EN_VALIDACION']

async function actualizar(
  id: string,
  patch: ActualizarActividadInput,
  rol: Rol | undefined,
  actorId: string,
  actorNombre: string,
): Promise<ServiceResult<Actividad>> {
  const db = getDb()
  const original = db.actividades.find((a) => a.id === id)
  if (!original) return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'Actividad no encontrada.' } })

  const esGestor = can(rol, 'actividades.editar_cualquiera')
  const esAsignado = original.responsableId === actorId || original.equipoIds.includes(actorId)

  if (!esGestor) {
    if (!can(rol, 'actividades.avanzar_propia') || !esAsignado) {
      return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para modificar esta actividad.' } })
    }
    const camposPermitidos: (keyof ActualizarActividadInput)[] = ['estatus', 'avance', 'bloqueoMotivo']
    const camposRecibidos = Object.keys(patch) as (keyof ActualizarActividadInput)[]
    const noPermitido = camposRecibidos.find((c) => !camposPermitidos.includes(c))
    if (noPermitido) {
      return delay({ ok: false, error: { code: 'CAMPO_NO_PERMITIDO', message: 'No puedes modificar ese campo de la actividad.' } })
    }
    if (patch.estatus && !TRANSICIONES_PERSONAL.includes(patch.estatus)) {
      return delay({
        ok: false,
        error: { code: 'TRANSICION_NO_PERMITIDA', message: 'Solo puedes mover la actividad a en proceso, bloqueada o en validación.' },
      })
    }
  }

  if (patch.peso !== undefined) {
    const disponible = pesoDisponible(db, original.proyectoId, id)
    if (patch.peso <= 0 || patch.peso > disponible) {
      return delay({
        ok: false,
        error: {
          code: 'PESO_EXCEDIDO',
          message: `El peso total de las actividades no puede superar 100%. Disponible: ${disponible}%.`,
        },
      })
    }
  }

  if (patch.avance !== undefined && (patch.avance < 0 || patch.avance > 100)) {
    return delay({ ok: false, error: { code: 'AVANCE_INVALIDO', message: 'El avance debe estar entre 0 y 100.' } })
  }

  const actualizada = mutateDb((db) => {
    const a = db.actividades.find((a) => a.id === id)!
    Object.assign(a, patch, { actualizadoEn: nowIso() })
    if (patch.estatus === 'COMPLETADA') a.avance = 100
    if (patch.estatus === 'CANCELADA') a.avance = a.avance
    recalcularAvanceProyecto(db, a.proyectoId)
    return { ...a }
  })

  registrarBitacora({
    actorId,
    actorNombre,
    accion: 'ACTIVIDAD_ACTUALIZADA',
    detalle: `Se actualizó la actividad ${actualizada.folio}${patch.estatus ? ` → ${patch.estatus}` : ''}.`,
    entidad: 'actividad',
    entidadId: actualizada.id,
  })

  return delay({ ok: true, data: actualizada })
}

async function validar(
  id: string,
  rol: Rol | undefined,
  aprobar: boolean,
  actorId: string,
  actorNombre: string,
): Promise<ServiceResult<Actividad>> {
  if (!can(rol, 'actividades.validar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para validar actividades.' } })
  }
  const db = getDb()
  const original = db.actividades.find((a) => a.id === id)
  if (!original) return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'Actividad no encontrada.' } })
  if (original.estatus !== 'EN_VALIDACION') {
    return delay({ ok: false, error: { code: 'ESTADO_INVALIDO', message: 'Solo se pueden validar actividades en validación.' } })
  }

  const actualizada = mutateDb((db) => {
    const a = db.actividades.find((a) => a.id === id)!
    a.estatus = aprobar ? 'COMPLETADA' : 'EN_PROCESO'
    a.avance = aprobar ? 100 : a.avance
    a.actualizadoEn = nowIso()
    recalcularAvanceProyecto(db, a.proyectoId)
    return { ...a }
  })

  registrarBitacora({
    actorId,
    actorNombre,
    accion: aprobar ? 'ACTIVIDAD_VALIDADA' : 'ACTIVIDAD_RECHAZADA_VALIDACION',
    detalle: `${aprobar ? 'Validó y completó' : 'Regresó a proceso'} la actividad ${actualizada.folio}.`,
    entidad: 'actividad',
    entidadId: actualizada.id,
  })

  return delay({ ok: true, data: actualizada })
}

export const actividadesDemo = { listarPorProyecto, listarAsignadas, obtener, crear, actualizar, validar }
