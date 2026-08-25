import { IS_DEMO } from './config'
import { evidenciasDemo } from './demo/evidencias.demo'
import { evidenciasApi } from './api/evidencias.api'

export const evidenciasService = IS_DEMO ? evidenciasDemo : evidenciasApi
export type { NuevaEvidenciaInput } from './demo/evidencias.demo'
