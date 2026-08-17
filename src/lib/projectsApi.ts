// Capa de servicio tipada para el módulo de Gestión de Proyectos.
//
// Todavía no existe un webhook de n8n en producción para este módulo (a
// diferencia de PBI-01..07). Por eso, en esta primera versión, la fuente de
// verdad es demoStore.ts. Esta función deja preparado — y documentado — el
// contrato de payload que se enviaría a n8n en cuanto se configure
// VITE_PROJECTS_REQUEST_URL: si la variable existe, se hace un intento de
// notificación "best effort" (no bloquea la UI ni sustituye al registro
// local; si falla, solo se registra en consola sin mostrar error al usuario,
// porque el registro real de la solicitud ya quedó guardado en demoStore).
//
// Payload documentado de "nueva solicitud de proyecto" (POST JSON):
// {
//   folio: string
//   nombreSolicitante: string
//   correoSolicitante: string
//   areaSolicitante: string
//   nombreProyecto: string
//   descripcion: string
//   problemaONecesidad: string
//   objetivo: string
//   beneficioEsperado: string
//   fechaInicioDeseada: string   // ISO 8601
//   fechaTerminoEstimada: string // ISO 8601
//   prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica'
//   areaResponsableSugerida: string
//   comentariosAdicionales?: string
//   archivosIniciales: Array<{ nombreArchivo: string; tipo: string; tamanoBytes: number }>
//   creadoEn: string // ISO 8601
// }
// Respuesta esperada: { ok: boolean, error?: string }

import type { ProjectRequest } from './types'

const PROJECTS_REQUEST_URL = import.meta.env.VITE_PROJECTS_REQUEST_URL ?? ''

export async function notificarSolicitudAN8n(request: ProjectRequest): Promise<void> {
  if (!PROJECTS_REQUEST_URL) return // modo demo: no hay endpoint configurado todavía
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    await fetch(PROJECTS_REQUEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        folio: request.folio,
        nombreSolicitante: request.nombreSolicitante,
        correoSolicitante: request.correoSolicitante,
        areaSolicitante: request.areaSolicitante,
        nombreProyecto: request.nombreProyecto,
        descripcion: request.descripcion,
        problemaONecesidad: request.problemaONecesidad,
        objetivo: request.objetivo,
        beneficioEsperado: request.beneficioEsperado,
        fechaInicioDeseada: request.fechaInicioDeseada,
        fechaTerminoEstimada: request.fechaTerminoEstimada,
        prioridad: request.prioridad,
        areaResponsableSugerida: request.areaResponsableSugerida,
        comentariosAdicionales: request.comentariosAdicionales,
        archivosIniciales: request.archivosIniciales.map((a) => ({ nombreArchivo: a.nombreArchivo, tipo: a.tipo, tamanoBytes: a.tamanoBytes })),
        creadoEn: request.creadoEn,
      }),
    })
    clearTimeout(timeout)
  } catch (err) {
    // No se interrumpe el flujo del usuario: la solicitud ya quedó registrada en demoStore.
    console.warn('No se pudo notificar la solicitud a n8n (VITE_PROJECTS_REQUEST_URL). Se conserva en modo demostración.', err)
  }
}

export const PROJECTS_MODE: 'demo' | 'n8n-preparado' = PROJECTS_REQUEST_URL ? 'n8n-preparado' : 'demo'
