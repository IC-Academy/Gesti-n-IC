// Cliente HTTP para los contratos n8n PBI-01 a PBI-07. Las URLs se inyectan
// por entorno; nunca se versionan endpoints reales en el repositorio.
//
// Si la variable VITE_PBI0X_URL correspondiente no está configurada (por
// ejemplo en un fork del repo, en un preview, o mientras el equipo de n8n
// termina un flujo), la función cae a un MODO DEMOSTRACIÓN local
// (src/lib/pbiDemoFallback.ts) para que la pantalla nunca se quede en blanco
// ni truene por un fetch a una URL vacía. El resultado trae `demo: true` para
// que la UI pueda avisar claramente que la respuesta es simulada. En cuanto
// la variable de entorno existe, esta función vuelve a llamar siempre al
// webhook real: el modo demo nunca sustituye una URL ya configurada.

import { ENV, getApiKey } from './config'
import {
  demoConsultarAprobacion,
  demoConsultarSolicitud,
  demoEnviarAutorizacion,
  demoGuardarEvaluacion,
  demoListarSolicitudes,
  demoRegistrarDecision,
  demoRegistrarSolicitud,
} from './pbiDemoFallback'
import type {
  ApiResult,
  RegistrarSolicitudPayload,
  RegistrarSolicitudResponse,
  ConsultarSolicitudPayload,
  ConsultarSolicitudResponse,
  ListarSolicitudesPayload,
  ListarSolicitudesResponse,
  GuardarEvaluacionPayload,
  GuardarEvaluacionResponse,
  EnviarAutorizacionPayload,
  EnviarAutorizacionResponse,
  ConsultarAprobacionPayload,
  ConsultarAprobacionResponse,
  RegistrarDecisionPayload,
  RegistrarDecisionResponse,
} from './types'

function demoResult<T>(data: T): ApiResult<T> {
  return { ok: true, status: 200, data, networkError: false, demo: true }
}

async function postJson<TResponse>(
  url: string,
  body: unknown,
  opts: { withApiKey?: boolean } = {},
): Promise<ApiResult<TResponse>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.withApiKey) {
    headers['x-api-key'] = getApiKey()
  }

  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    window.clearTimeout(timeout)

    let data: TResponse | null = null
    try {
      data = (await res.json()) as TResponse
    } catch {
      data = null
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
      networkError: false,
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      networkError: true,
      errorMessage: err instanceof Error ? err.message : 'Error de red desconocido',
    }
  }
}

export async function registrarSolicitud(payload: RegistrarSolicitudPayload) {
  if (!ENV.PBI01_URL) return demoResult(demoRegistrarSolicitud(payload))
  return postJson<RegistrarSolicitudResponse>(ENV.PBI01_URL, payload, { withApiKey: true })
}

export async function consultarSolicitud(payload: ConsultarSolicitudPayload) {
  if (!ENV.PBI02_URL) return demoResult(demoConsultarSolicitud(payload.folio, payload.correo, payload.codigo))
  return postJson<ConsultarSolicitudResponse>(ENV.PBI02_URL, payload)
}

export async function listarSolicitudes(payload: ListarSolicitudesPayload) {
  if (!ENV.PBI03_URL) return demoResult(demoListarSolicitudes(payload.estados, payload.area))
  return postJson<ListarSolicitudesResponse>(ENV.PBI03_URL, payload, { withApiKey: true })
}

export async function guardarEvaluacion(payload: GuardarEvaluacionPayload) {
  if (!ENV.PBI04_URL) return demoResult(demoGuardarEvaluacion(payload))
  return postJson<GuardarEvaluacionResponse>(ENV.PBI04_URL, payload, { withApiKey: true })
}

export async function enviarAutorizacion(payload: EnviarAutorizacionPayload) {
  if (!ENV.PBI05_URL) return demoResult(demoEnviarAutorizacion(payload.folio))
  return postJson<EnviarAutorizacionResponse>(ENV.PBI05_URL, payload, { withApiKey: true })
}

export async function consultarAprobacion(payload: ConsultarAprobacionPayload) {
  if (!ENV.PBI06_URL) return demoResult(demoConsultarAprobacion())
  return postJson<ConsultarAprobacionResponse>(ENV.PBI06_URL, payload)
}

export async function registrarDecision(payload: RegistrarDecisionPayload) {
  if (!ENV.PBI07_URL) return demoResult(demoRegistrarDecision())
  return postJson<RegistrarDecisionResponse>(ENV.PBI07_URL, payload)
}
