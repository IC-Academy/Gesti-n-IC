import type { OtpProposito, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { SolicitarOtpResult } from '../demo/otp.demo'

async function solicitar(
  destino: string,
  proposito: OtpProposito,
  referenciaId?: string,
): Promise<ServiceResult<SolicitarOtpResult>> {
  const path = proposito === 'CONSULTAR_ESTATUS' ? ENDPOINTS.publicStatusRequestOtp : ENDPOINTS.authRequestOtp
  return http.post<SolicitarOtpResult>(path, { destino, proposito, referenciaId })
}

async function verificar(
  destino: string,
  proposito: OtpProposito,
  codigo: string,
  referenciaId?: string,
): Promise<ServiceResult<{ verificado: true }>> {
  const path = proposito === 'CONSULTAR_ESTATUS' ? ENDPOINTS.publicStatusVerify : ENDPOINTS.authVerifyOtp
  return http.post<{ verificado: true }>(path, { destino, proposito, codigo, referenciaId })
}

export const otpApi = { solicitar, verificar }
