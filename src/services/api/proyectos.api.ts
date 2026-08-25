import type { Rol, ServiceResult, Proyecto } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { ActualizarProyectoInput, NuevoProyectoInput } from '../demo/proyectos.demo'

async function listar(_rol: Rol | undefined, _usuarioId?: string): Promise<ServiceResult<Proyecto[]>> {
  return http.get(ENDPOINTS.projects)
}

async function obtener(id: string, _rol: Rol | undefined, _usuarioId?: string): Promise<ServiceResult<Proyecto>> {
  return http.get(ENDPOINTS.projectById(id))
}

async function crear(
  input: NuevoProyectoInput,
  _rol: Rol | undefined,
  _actorId: string,
  _actorNombre: string,
): Promise<ServiceResult<Proyecto>> {
  return http.post(ENDPOINTS.projects, input)
}

async function actualizar(id: string, patch: ActualizarProyectoInput, _rol: Rol | undefined): Promise<ServiceResult<Proyecto>> {
  return http.patch(ENDPOINTS.projectById(id), patch)
}

export const proyectosApi = { listar, obtener, crear, actualizar }
