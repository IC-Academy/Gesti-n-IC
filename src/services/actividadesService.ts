import { IS_DEMO } from './config'
import { actividadesDemo } from './demo/actividades.demo'
import { actividadesApi } from './api/actividades.api'

export const actividadesService = IS_DEMO ? actividadesDemo : actividadesApi
export type { NuevaActividadInput, ActualizarActividadInput } from './demo/actividades.demo'
