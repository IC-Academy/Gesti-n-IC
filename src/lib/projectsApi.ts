// Capa de servicio tipada para el módulo de Gestión de Proyectos.
//
// Todavía no existe un webhook de n8n en producción para este módulo (a
// diferencia de PBI-01..07). Por eso, en esta primera versión, la fuente de
// verdad es demoStore.ts. Esta función deja preparado — y documentado — el
// contrato de payload que se enviaría a n8n en cuanto se configure
// VITE_PROJECTS_REQUEST_URL: si la variable existe, se hace un intento de
// sincronización explícita. El resultado permite a la UI distinguir entre
// guardado local, sincronización exitosa y error de sincronización.
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

export interface ProjectSyncResult {
  status: 'local' | 'synced' | 'error'
  message: string
}

export async function notificarSolicitudAN8n(request: ProjectRequest): Promise<ProjectSyncResult> {
  if (!PROJECTS_REQUEST_URL) {
    return { status: 'local', message: 'Guardada solamente en este navegador; no hay integración externa configurada.' }
  }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(PROJECTS_REQUEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        folio: request.folio,
        nombreSolicitante: request.nombreSolicitante,
        correoSolicitante: request.correoSolicitante,
        areaSolicitante: request.areaSolicitante,
        inmueble: request.inmueble,
        ubicacionEspecifica: request.ubicacionEspecifica,
        tipoMantenimiento: request.tipoMantenimiento,
        especialidad: request.especialidad,
        impactoOperativo: request.impactoOperativo,
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
    if (!response.ok) {
      return { status: 'error', message: `Guardada localmente, pero n8n respondió con HTTP ${response.status}.` }
    }
    return { status: 'synced', message: 'Guardada localmente y enviada correctamente a n8n.' }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error
        ? `Guardada localmente; no se pudo sincronizar: ${err.message}`
        : 'Guardada localmente; no se pudo sincronizar con n8n.',
    }
  }
}

export const PROJECTS_MODE: 'demo' | 'n8n-preparado' = PROJECTS_REQUEST_URL ? 'n8n-preparado' : 'demo'
