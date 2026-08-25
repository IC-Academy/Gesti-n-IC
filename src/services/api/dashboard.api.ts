import type { Rol, ServiceResult } from '../../types'
import { http, ENDPOINTS } from '../http'
import type { DashboardData } from '../demo/dashboard.demo'

async function obtener(_rol: Rol | undefined): Promise<ServiceResult<DashboardData>> {
  return http.get(ENDPOINTS.dashboard)
}

export const dashboardApi = { obtener }
