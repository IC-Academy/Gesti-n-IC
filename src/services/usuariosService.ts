import { IS_DEMO } from './config'
import { usuariosDemo } from './demo/usuarios.demo'
import { usuariosApi } from './api/usuarios.api'

export const usuariosService = IS_DEMO ? usuariosDemo : usuariosApi
export type { NuevoUsuarioInput, ActualizarUsuarioInput } from './demo/usuarios.demo'
