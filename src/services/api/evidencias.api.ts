import type { Evidencia, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { NuevaEvidenciaInput } from '../demo/evidencias.demo'

async function subir(input: NuevaEvidenciaInput): Promise<ServiceResult<Evidencia>> {
  const destino = input.actividadId ?? input.proyectoId ?? input.solicitudId ?? ''
  return http.post(ENDPOINTS.taskEvidence(destino), input)
}

async function listarPorActividad(actividadId: string): Promise<ServiceResult<Evidencia[]>> {
  return http.get(`${ENDPOINTS.taskById(actividadId)}/evidence`)
}

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Evidencia[]>> {
  return http.get(`${ENDPOINTS.projectById(proyectoId)}/evidence`)
}

async function listarVisiblesParaSolicitante(solicitudId: string): Promise<ServiceResult<Evidencia[]>> {
import type { Evidencia, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { NuevaEvidenciaInput } from '../demo/evidencias.demo'

async function subir(input: NuevaEvidenciaInput): Promise<ServiceResult<Evidencia>> {
  const destino = input.actividadId ?? input.proyectoId ?? input.solicitudId ?? ''
  return http.post(ENDPOINTS.taskEvidence(destino), input)
}

async function listarPorActividad(actividadId: string): Promise<ServiceResult<Evidencia[]>> {
  return http.get(`${ENDPOINTS.taskById(actividadId)}/evidence`)
}

async function listarPorSolicitud(solicitudId: string): Promise<ServiceResult<Evidencia[]>> {
  return http.get(`${ENDPOINTS.requests}/${solicitudId}/evidence`)
}

async function listarPorProyecto(proyectoId: string): Promise<ServiceResult<Evidencia[]>> {
  return http.get(`${ENDPOINTS.projectById(proyectoId)}/evidence`)
}

async function listarVisiblesParaSolicitante(solicitudId: string): Promise<ServiceResult<Evidencia[]>> {
  return http.get(`${ENDPOINTS.requestById(solicitudId)}/evidence`)
}

export const evidenciasApi = { subir, listarPorActividad, listarPorSolicitud, listarPorProyecto, listarVisiblesParaSolicitante }
  return http.get(`${ENDPOINTS.requestById(solicitudId)}/evidence`)
}

export const evidenciasApi = { subir, listarPorActividad, listarPorProyecto, listarVisiblesParaSolicitante }
