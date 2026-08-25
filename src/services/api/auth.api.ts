import type { ServiceResult, SesionUsuario } from '../../types'
import { http, ENDPOINTS, setSessionToken } from '../http'

async function login(usuario: string, password: string): Promise<ServiceResult<SesionUsuario>> {
  const result = await http.post<SesionUsuario>(ENDPOINTS.authLogin, { usuario, password })
  if (result.ok) setSessionToken(result.data.token)
  return result
}

export const authApi = { login }
