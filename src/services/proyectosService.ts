import { IS_DEMO } from './config'
import { proyectosDemo } from './demo/proyectos.demo'
import { proyectosApi } from './api/proyectos.api'

export const proyectosService = IS_DEMO ? proyectosDemo : proyectosApi
export type { NuevoProyectoInput, ActualizarProyectoInput } from './demo/proyectos.demo'
