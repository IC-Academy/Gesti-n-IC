import { IS_DEMO } from './config'
import { solicitudesDemo } from './demo/solicitudes.demo'
import { solicitudesApi } from './api/solicitudes.api'

export const solicitudesService = IS_DEMO ? solicitudesDemo : solicitudesApi
export type { NuevaSolicitudInput, DecisionInput, ConsultaEstatusInput } from './demo/solicitudes.demo'
export { correoValido } from './demo/solicitudes.demo'
