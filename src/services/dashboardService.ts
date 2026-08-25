import { IS_DEMO } from './config'
import { dashboardDemo } from './demo/dashboard.demo'
import { dashboardApi } from './api/dashboard.api'

export const dashboardService = IS_DEMO ? dashboardDemo : dashboardApi
export type { DashboardData, CargaResponsable, TendenciaMensual, ProyectoAtencion } from './demo/dashboard.demo'
