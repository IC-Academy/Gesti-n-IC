import type { Evidencia, EvidenciaVisibilidad, ServiceResult } from '../../types'
import { delay, getDb, mutateDb, newId, nowIso } from './db'
import { registrarBitacora } from './bitacora'

export interface NuevaEvidenciaInput {
  nombre: string
  url: string
  tipo: string
  solicitudId?: string
  actividadId?: string
  proyectoId?: string
  subidoPor: string
  subidoPorNombre: string
  visibilidad?: EvidenciaVisibilidad
}

async function subir(input: NuevaEvidenciaInput): Promise<ServiceResult<Evidencia>> {
  const evidencia = mutateDb((db) => {
    const e: Evidencia = {
      id: newId('evd'),
      nombre: input.nombre,
      url: input.url,
      tipo: input.tipo,
      solicitudId: input.solicitudId,
      actividadId: input.actividadId,
      proyectoId: input.proyectoId,
      subidoPor: input.subidoPor,
      visibilidad: input.visibilidad ?? 'INTERNA',
      creadoEn: nowIso(),
    }
    db.evidencias.push(e)
    return e
  })

  registrarBitacora({
    actorId: input.subidoPor,
    actorNombre: input.subidoPorNombre,
    accion: 'EVIDENCIA_CARGADA',
    detalle: `Se cargó la evidencia "${input.nombre}".`,
    entidad: 'evidencia',
    entidadId: evidencia.id,
  })

  return delay({ ok: true, data: evidencia })
}

async function listarPorActividad(actividadId: string): Promise<ServiceResult<Evidencia[]>> {
  const db = getDb()
  return delay({ ok: true, data: db.evidencias.filter((e) => e.actividadId === actividadId) })
}

async function listarPorSolicitud(solicitudId: string): Promise<ServiceResult<Evidencia[]>> {
  const db = getDb()
  return delay({ ok: true, data: db.evidencias.filter((e) => e.solicitudId === solicitudId) })
}

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Evidencia[]>> {
  const db = getDb()
  return delay({
    ok: true,
    data: db.evidencias.filter((e) => e.proyectoId === proyectoId || db.actividades.some((a) => a.proyectoId === proyectoId && a.id === e.actividadId)),
  })
}

async function listarVisiblesParaSolicitante(solicitudId: string, proyectoId?: string): Promise<ServiceResult<Evidencia[]>> {
  const db = getDb()
  const data = db.evidencias.filter(
    (e) => e.visibilidad === 'SOLICITANTE' && (e.solicitudId === solicitudId || (proyectoId && (e.proyectoId === proyectoId || db.actividades.some((a) => a.proyectoId === proyectoId && a.id === e.actividadId)))),
  )
  return delay({ ok: true, data })
}

export const evidenciasDemo = { subir, listarPorActividad, listarPorSolicitud, listarPorProyecto, listarVisiblesParaSolicitante }
