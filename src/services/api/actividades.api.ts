import type { Actividad, Rol, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { ActualizarActividadInput, NuevaActividadInput } from '../demo/actividades.demo'

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Actividad[]>> {
  return http.get(ENDPOINTS.projectTasks(proyectoId))
}

async function listarAsignadas(_usuarioId: string): Promise<ServiceResult<Actividad[]>> {
  return http.get(`${ENDPOINTS.requests}/../tasks?mine=1`)
}

async function obtener(id: string): Promise<ServiceResult<Actividad>> {
  return http.get(ENDPOINTS.taskById(id))
}

async function crear(input: NuevaActividadInput, _rol: Rol | undefined): Promise<ServiceResult<Actividad>> {
  return http.post(ENDPOINTS.projectTasks(input.proyectoId), input)
}

import type { Actividad, Rol, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { ActualizarActividadInput, NuevaActividadInput } from '../demo/actividades.demo'

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Actividad[]>> {
  return http.get(ENDPOINTS.projectTasks(proyectoId))
}

async function listarAsignadas(_usuarioId: string): Promise<ServiceResult<Actividad[]>> {
  return http.get(`${ENDPOINTS.requests}/../tasks?mine=1`)
}

async function obtener(id: string, _rol?: Rol, _usuarioId?: string): Promise<ServiceResult<Actividad>> {
  return http.get(ENDPOINTS.taskById(id))
}

async function crear(input: NuevaActividadInput, _rol: Rol | undefined): Promise<ServiceResult<Actividad>> {
  return http.post(ENDPOINTS.projectTasks(input.proyectoId), input)
}

async function actualizar(
  id: string,
  patch: ActualizarActividadInput,
  _rol: Rol | undefined,
  _actorId: string,
  _actorNombre: string,
): Promise<ServiceResult<Actividad>> {
  return http.patch(ENDPOINTS.taskById(id), patch)
}

async function validar(
  id: string,
  _rol: Rol | undefined,
  aprobar: boolean,
  _actorId: string,
  _actorNombre: string,
): Promise<ServiceResult<Actividad>> {
  return http.patch(ENDPOINTS.taskById(id), { estatus: aprobar ? 'COMPLETADA' : 'EN_PROCESO' })
}

export const actividadesApi = { listarPorProyecto, listarAsignadas, obtener, crear, actualizar, validar }
async function actualizar(
  id: string,
  patch: ActualizarActividadInput,
  _rol: Rol | undefined,
  _actorId: string,
  _actorNombre: string,
): Promise<ServiceResult<Actividad>> {
  return http.patch(ENDPOINTS.taskById(id), patch)
}

async function validar(
  id: string,
  _rol: Rol | undefined,
  aprobar: boolean,
  _actorId: string,
  _actorNombre: string,
): Promise<ServiceResult<Actividad>> {
  return http.patch(ENDPOINTS.taskById(id), { estatus: aprobar ? 'COMPLETADA' : 'EN_PROCESO' })
}

export const actividadesApi = { listarPorProyecto, listarAsignadas, obtener, crear, actualizar, validar }
