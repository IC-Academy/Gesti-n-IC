import type { Comentario, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { NuevoComentarioInput } from '../demo/comentarios.demo'

async function crear(input: NuevoComentarioInput): Promise<ServiceResult<Comentario>> {
  const destino = input.actividadId ?? input.proyectoId ?? input.solicitudId ?? ''
  return http.post(ENDPOINTS.taskComments(destino), input)
}

async function listarPorActividad(actividadId: string): Promise<ServiceResult<Comentario[]>> {
  return http.get(`${ENDPOINTS.taskById(actividadId)}/comments`)
}

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Comentario[]>> {
  return http.get(`${ENDPOINTS.projectById(proyectoId)}/comments`)
}

async function listarSolicitanteVisibles(solicitudId: string): Promise<ServiceResult<Comentario[]>> {
  return http.get(`${ENDPOINTS.requestById(solicitudId)}/comments`)
}

export const comentariosApi = { crear, listarPorActividad, listarPorProyecto, listarSolicitanteVisibles }
