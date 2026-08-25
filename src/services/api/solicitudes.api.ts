import type { Rol, ServiceResult, Solicitud } from '../../types'
import { http, ENDPOINTS } from '../http'
import type {
  ConsultaEstatusInput,
  DecisionInput,
  NuevaSolicitudInput,
} from '../demo/solicitudes.demo'

async function iniciar(input: NuevaSolicitudInput): Promise<ServiceResult<{ solicitudId: string; folio: string }>> {
  return http.post(ENDPOINTS.publicRequestsStart, input)
}

async function confirmar(solicitudId: string): Promise<ServiceResult<Solicitud>> {
  return http.post(ENDPOINTS.publicRequestsConfirm, { solicitudId })
}

async function listar(_rol: Rol | undefined): Promise<ServiceResult<Solicitud[]>> {
  return http.get(ENDPOINTS.requests)
}

async function obtener(id: string, _rol: Rol | undefined): Promise<ServiceResult<Solicitud>> {
  return http.get(ENDPOINTS.requestById(id))
}

async function decidir(id: string, _rol: Rol | undefined, input: DecisionInput): Promise<ServiceResult<Solicitud>> {
  return http.post(ENDPOINTS.requestDecision(id), input)
}

async function iniciarConsultaEstatus(input: ConsultaEstatusInput): Promise<ServiceResult<{ solicitudId: string }>> {
  return http.post(ENDPOINTS.publicStatusRequestOtp, input)
}

async function obtenerEstatusPublico(folio: string): Promise<ServiceResult<Solicitud>> {
  return http.post(ENDPOINTS.publicStatusVerify, { folio })
}

export const solicitudesApi = {
  iniciar,
  confirmar,
  listar,
  obtener,
  decidir,
  iniciarConsultaEstatus,
  obtenerEstatusPublico,
}
