// Modo demostración para el flujo real de n8n (PBI-01 a PBI-07).
//
// Si alguna variable VITE_PBI0X_URL no está configurada, la app NO debe
// quedar en blanco ni truena al hacer fetch('') — en su lugar, cada función
// de src/lib/api.ts cae aquí y simula una respuesta razonable, guardada en un
// pequeño "libro" en memoria para que registrar → consultar → bandeja → etc.
// se sienta coherente durante una demostración sin backend real.
//
// En cuanto la variable de entorno correspondiente se configure (build real
// con las URLs de producción), este archivo deja de usarse por completo para
// ese endpoint: api.ts siempre prefiere la llamada real cuando hay URL.

import type {
  ConsultarAprobacionResponse,
  ConsultarSolicitudResponse,
  EnviarAutorizacionResponse,
  GuardarEvaluacionPayload,
  GuardarEvaluacionResponse,
  ListarSolicitudesResponse,
  RegistrarDecisionResponse,
  RegistrarSolicitudPayload,
  RegistrarSolicitudResponse,
  SolicitudBandeja,
} from './types'

interface RegistroDemo {
  folio: string
  codigoConsulta: string
  payload: RegistrarSolicitudPayload
  estado: string
  fechaRegistro: string
  avance: number
}

const libro: RegistroDemo[] = []
let folioSeq = 100

function nuevoFolio() {
  folioSeq += 1
  return `DEMO-SOL-${new Date().getFullYear()}-${folioSeq}`
}

export function demoRegistrarSolicitud(payload: RegistrarSolicitudPayload): RegistrarSolicitudResponse {
  const folio = nuevoFolio()
  const codigoConsulta = Math.random().toString(36).slice(2, 8).toUpperCase()
  libro.push({ folio, codigoConsulta, payload, estado: 'Nueva', fechaRegistro: new Date().toISOString(), avance: 0 })
  return { ok: true, folio, codigoConsulta, estado: 'Nueva', fechaRegistro: new Date().toISOString() }
}

export function demoConsultarSolicitud(folio: string, correo: string, codigo: string): ConsultarSolicitudResponse {
  const r = libro.find(
    (x) => x.folio.toLowerCase() === folio.trim().toLowerCase() && x.codigoConsulta.toLowerCase() === codigo.trim().toLowerCase() && x.payload.correo.toLowerCase() === correo.trim().toLowerCase(),
  )
  if (!r) {
    return { ok: false, error: 'No se encontró una solicitud con esos datos (modo demostración: solo existen las solicitudes registradas en esta sesión).' }
  }
  return {
    ok: true,
    folio: r.folio,
    proyecto: r.payload.nombreProyecto,
    area: r.payload.area,
    fechaSolicitud: r.fechaRegistro,
    estado: r.estado,
    prioridad: r.payload.urgencia,
    posicionBacklog: 3,
    inicioAproximado: null,
    entregaAproximada: null,
    avance: r.avance,
    proximoPaso: 'Evaluación por el equipo de BI (modo demostración).',
    comentariosPublicos: 'Esta es una respuesta simulada porque VITE_PBI02_URL no está configurada.',
  }
}

export function demoListarSolicitudes(estados: string[], area: string): ListarSolicitudesResponse {
  const filtradas = libro.filter((r) => (estados.length ? estados.includes(r.estado) : true) && (area ? r.payload.area.toLowerCase().includes(area.toLowerCase()) : true))
  const solicitudes: SolicitudBandeja[] = filtradas.map((r, i) => ({
    recordId: `demo-${i}`,
    folio: r.folio,
    proyecto: r.payload.nombreProyecto,
    area: r.payload.area,
    solicitante: r.payload.solicitante,
    fechaSolicitud: r.fechaRegistro,
    fechaRequerida: r.payload.fechaRequerida,
    urgencia: r.payload.urgencia,
    estado: r.estado,
    diasSinAtender: 0,
    accion: 'Evaluar',
  }))
  return { ok: true, total: solicitudes.length, solicitudes }
}

export function demoGuardarEvaluacion(payload: GuardarEvaluacionPayload): GuardarEvaluacionResponse {
  const r = libro.find((x) => x.folio === payload.folio)
  const nuevoEstado = payload.accion === 'lista_autorizacion' ? 'Lista para autorización' : payload.accion === 'solicitar_informacion' ? 'Pendiente de información' : 'En evaluación BI'
  if (r) r.estado = nuevoEstado
  return { ok: true, folio: payload.folio, accion: payload.accion, estado: nuevoEstado }
}

export function demoEnviarAutorizacion(folio: string): EnviarAutorizacionResponse {
  const r = libro.find((x) => x.folio === folio)
  if (r) r.estado = 'En autorización'
  return { ok: true, folio, estado: 'En autorización', aprobadoresNotificados: 1 }
}

export function demoConsultarAprobacion(): ConsultarAprobacionResponse {
  return {
    ok: true,
    folio: 'DEMO-SOL-0000',
    proyecto: 'Solicitud de ejemplo (modo demostración)',
    area: 'Inteligencia de Negocios',
    solicitante: 'Persona solicitante de ejemplo',
    problema: 'VITE_PBI06_URL no está configurada; este es un token de ejemplo.',
    resultadoEsperado: 'Configura las variables de entorno para consultar aprobaciones reales.',
    diagnostico: 'N/D',
    solucionPropuesta: 'N/D',
    viabilidad: 'N/D',
    complejidad: 'N/D',
    horasEstimadas: 0,
    recomendacionBI: 'N/D',
    prioridadSugerida: 'Media',
    tuCargo: 'Aprobador de ejemplo',
    tuNombre: 'Demostración',
    decisionPrevia: undefined,
  }
}

export function demoRegistrarDecision(): RegistrarDecisionResponse {
  return { ok: true, folio: 'DEMO-SOL-0000', decisionRegistrada: 'Aprobar', resolucionFinal: 'Aprobada (simulada)', estadoSolicitud: 'Aprobada' }
}
