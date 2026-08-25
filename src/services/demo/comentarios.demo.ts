import type { Comentario, ComentarioAutorTipo, ServiceResult } from '../../types'
import { delay, getDb, mutateDb, newId, nowIso } from './db'

export interface NuevoComentarioInput {
  texto: string
  autorTipo: ComentarioAutorTipo
  autorId?: string
  autorNombre: string
  solicitudId?: string
  actividadId?: string
  proyectoId?: string
}

async function crear(input: NuevoComentarioInput): Promise<ServiceResult<Comentario>> {
  if (!input.texto.trim()) {
    return delay({ ok: false, error: { code: 'TEXTO_REQUERIDO', message: 'El comentario no puede estar vacío.' } })
  }
  const comentario = mutateDb((db) => {
    const c: Comentario = {
      id: newId('cmt'),
      texto: input.texto.trim(),
      autorTipo: input.autorTipo,
      autorId: input.autorId,
      autorNombre: input.autorNombre,
      solicitudId: input.solicitudId,
      actividadId: input.actividadId,
      proyectoId: input.proyectoId,
      creadoEn: nowIso(),
    }
    db.comentarios.push(c)
    return c
  })
  return delay({ ok: true, data: comentario })
}

async function listarPorActividad(actividadId: string): Promise<ServiceResult<Comentario[]>> {
  const db = getDb()
  return delay({ ok: true, data: db.comentarios.filter((c) => c.actividadId === actividadId) })
}

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Comentario[]>> {
  const db = getDb()
  return delay({ ok: true, data: db.comentarios.filter((c) => c.proyectoId === proyectoId) })
}

async function listarSolicitanteVisibles(solicitudId: string): Promise<ServiceResult<Comentario[]>> {
  const db = getDb()
  return delay({
    ok: true,
    data: db.comentarios.filter((c) => c.solicitudId === solicitudId && c.autorTipo === 'SOLICITANTE'),
  })
}

export const comentariosDemo = { crear, listarPorActividad, listarPorProyecto, listarSolicitanteVisibles }
