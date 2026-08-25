import { IS_DEMO } from './config'
import { authDemo } from './demo/auth.demo'
import { authApi } from './api/auth.api'

/**
 * Autenticación interna (usuarios de personal, jefes, líder y admin).
 * En producción se espera POST /auth/login contra el backend de n8n.
 */
export const authService = IS_DEMO ? authDemo : authApi
