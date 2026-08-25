import type { Rol, ServiceResult, Usuario } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { ActualizarUsuarioInput, NuevoUsuarioInput } from '../demo/usuarios.demo'

async function listar(_rol: Rol | undefined): Promise<ServiceResult<Usuario[]>> {
  return http.get(ENDPOINTS.users)
}

async function listarSeleccionables(_rol: Rol | undefined): Promise<ServiceResult<Usuario[]>> {
  return http.get(`${ENDPOINTS.users}?activos=1`)
}

async function crear(input: NuevoUsuarioInput, _rolActor: Rol | undefined, _actorNombre: string): Promise<ServiceResult<Usuario>> {
  return http.post(ENDPOINTS.users, input)
}

async function actualizar(
  id: string,
  patch: ActualizarUsuarioInput,
  _rolActor: Rol | undefined,
  _actorNombre: string,
): Promise<ServiceResult<Usuario>> {
  return http.patch(ENDPOINTS.userById(id), patch)
}

export const usuariosApi = { listar, listarSeleccionables, crear, actualizar }
