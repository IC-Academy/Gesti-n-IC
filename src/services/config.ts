// ============================================================================
// Configuración de la capa de servicios. Determina si la aplicación opera en
// "modo demo" (repositorio local en localStorage) o en "modo API" (webhooks
// de n8n mediante VITE_API_BASE_URL). Ningún token, API key ni secreto vive
// en este archivo ni en ningún otro punto del frontend: en modo API, la
// autenticación real (si aplica) se resuelve del lado del backend/n8n.
// ============================================================================

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Modo demo cuando no se definió VITE_API_BASE_URL. Puede forzarse
 * explícitamente con VITE_APP_MODE=demo|api.
 */
export const APP_MODE: 'demo' | 'api' = (() => {
  const forced = import.meta.env.VITE_APP_MODE as string | undefined
  if (forced === 'demo' || forced === 'api') return forced
  return API_BASE_URL ? 'api' : 'demo'
})()

export const IS_DEMO = APP_MODE === 'demo'
