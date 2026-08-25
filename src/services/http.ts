import { API_BASE_URL } from './config'
import type { ServiceError, ServiceResult } from '../types'

// ============================================================================
// Cliente HTTP genérico para "modo API". Se usa únicamente cuando
// VITE_API_BASE_URL está definida; nunca contiene credenciales embebidas.
// El token de sesión (si el backend lo emite) se guarda en memoria/sesión del
// navegador, jamás como constante en el código fuente.
// ============================================================================

let sessionToken: string | null = null

export function setSessionToken(token: string | null) {
  sessionToken = token
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<ServiceResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      const error: ServiceError = {
        code: `HTTP_${res.status}`,
        message: `La solicitud a ${path} falló (${res.status}).`,
      }
      return { ok: false, error }
    }

    const data = (await res.json()) as T
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      error: { code: 'NETWORK_ERROR', message: 'No fue posible conectar con el servicio.' },
    }
  }
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
}

/**
 * Catálogo de endpoints esperados del lado de n8n. Se centraliza aquí para
 * que, al conectar el modo API, cada servicio solo referencie estas rutas
 * (ninguna se asume existente hasta integrarse).
 */
export const ENDPOINTS = {
  authLogin: '/auth/login',
  authRequestOtp: '/auth/request-otp',
  authVerifyOtp: '/auth/verify-otp',
  publicRequestsStart: '/public/requests/start',
  publicRequestsConfirm: '/public/requests/confirm',
  publicStatusRequestOtp: '/public/status/request-otp',
  publicStatusVerify: '/public/status/verify',
  requests: '/requests',
  requestById: (id: string) => `/requests/${id}`,
  requestDecision: (id: string) => `/requests/${id}/decision`,
  projects: '/projects',
  projectById: (id: string) => `/projects/${id}`,
  projectTasks: (id: string) => `/projects/${id}/tasks`,
  taskById: (id: string) => `/tasks/${id}`,
  taskComments: (id: string) => `/tasks/${id}/comments`,
  taskEvidence: (id: string) => `/tasks/${id}/evidence`,
  dashboard: '/dashboard',
  users: '/users',
  userById: (id: string) => `/users/${id}`,
} as const
