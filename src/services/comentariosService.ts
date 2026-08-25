import { IS_DEMO } from './config'
import { comentariosDemo } from './demo/comentarios.demo'
import { comentariosApi } from './api/comentarios.api'

export const comentariosService = IS_DEMO ? comentariosDemo : comentariosApi
export type { NuevoComentarioInput } from './demo/comentarios.demo'
