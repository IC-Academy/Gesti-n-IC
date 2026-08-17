// Tipos compartidos de los contratos reales de los webhooks PBI-01 a PBI-07.
// Reflejan exactamente los campos que devuelven/reciben los workflows de n8n
// (ver /n8n-workflows/*.json y el README del backend para el detalle completo).

export interface ApiResult<T> {
  ok: boolean
  status: number
  data: T | null
  networkError: boolean
  errorMessage?: string
  /** true cuando la respuesta fue simulada localmente porque falta la variable VITE_PBI0X_URL. */
  demo?: boolean
}

// ---------- PBI-01 Registrar Solicitud ----------
export interface RegistrarSolicitudPayload {
  nombreProyecto: string
  area: string
  solicitante: string
  correo: string
  responsableFuncional: string
  tipoProyecto: string
  problemaActual: string
  resultadoEsperado: string
  usuariosImpactados: string
  beneficioEsperado: string
  fuenteDatos: string
  fechaRequerida: string
  urgencia: string
  justificacionUrgencia: string
  comentariosAdicionales: string
}

export interface RegistrarSolicitudResponse {
  ok: boolean
  folio?: string
  codigoConsulta?: string
  estado?: string
  fechaRegistro?: string
  errors?: string[]
  error?: string
}

// ---------- PBI-02 Consultar Solicitud ----------
export interface ConsultarSolicitudPayload {
  folio: string
  correo: string
  codigo: string
}

export interface ConsultarSolicitudResponse {
  ok: boolean
  folio?: string
  proyecto?: string
  area?: string
  fechaSolicitud?: string
  estado?: string
  prioridad?: string | null
  posicionBacklog?: number | null
  inicioAproximado?: string | null
  entregaAproximada?: string | null
  avance?: number | null
  proximoPaso?: string | null
  comentariosPublicos?: string | null
  errors?: string[]
  error?: string
}

// ---------- PBI-03 Listar Solicitudes (Bandeja BI) ----------
export interface ListarSolicitudesPayload {
  estados: string[]
  area: string
}

export interface SolicitudBandeja {
  recordId: string
  folio: string
  proyecto: string
  area: string
  solicitante: string
  fechaSolicitud: string | null
  fechaRequerida: string | null
  urgencia: string
  estado: string
  diasSinAtender: number | null
  accion: string
}

export interface ListarSolicitudesResponse {
  ok: boolean
  total?: number
  solicitudes?: SolicitudBandeja[]
  error?: string
}

// ---------- PBI-04 Guardar Evaluación ----------
export type AccionEvaluacion = 'guardar_borrador' | 'solicitar_informacion' | 'lista_autorizacion'

export interface GuardarEvaluacionPayload {
  folio: string
  evaluadoPor: string
  accion: AccionEvaluacion
  diagnosticoInicial: string
  solucionPropuesta: string
  viabilidadTecnica: string
  viabilidadDatos: string
  complejidad: string
  horasEstimadas: number | null
  diasHabilesEstimados: number | null
  dependencias: string
  riesgos: string
  beneficioEsperadoBI: string
  prioridadSugerida: string
  posicionPropuesta: number | null
  inicioAproximado: string
  entregaAproximada: string
  recomendacion: string
  notasDireccion: string
  informacionRequerida: string
}

export interface GuardarEvaluacionResponse {
  ok: boolean
  folio?: string
  accion?: string
  estado?: string
  errors?: string[]
  error?: string
}

// ---------- PBI-05 Enviar a Autorización ----------
export interface EnviarAutorizacionPayload {
  folio: string
  enviadoPor: string
}

export interface EnviarAutorizacionResponse {
  ok: boolean
  folio?: string
  estado?: string
  aprobadoresNotificados?: number
  error?: string
}

// ---------- PBI-06 Consultar Aprobación ----------
export interface ConsultarAprobacionPayload {
  token: string
}

export interface ConsultarAprobacionResponse {
  ok: boolean
  folio?: string
  proyecto?: string
  area?: string
  solicitante?: string
  problema?: string
  resultadoEsperado?: string
  diagnostico?: string
  solucionPropuesta?: string
  viabilidad?: string
  complejidad?: string
  horasEstimadas?: number
  recomendacionBI?: string
  prioridadSugerida?: string
  tuCargo?: string
  tuNombre?: string
  decisionPrevia?: string
  error?: string
}

// ---------- PBI-07 Registrar Decisión ----------
export type DecisionAprobador =
  | 'Aprobar'
  | 'Aprobar como urgente'
  | 'Aprobar con ajustes'
  | 'Solicitar información adicional'
  | 'Rechazar'

export interface RegistrarDecisionPayload {
  token: string
  decision: DecisionAprobador
  comentarios: string
  condiciones: string
  prioridadAutorizada: string
}

export interface RegistrarDecisionResponse {
  ok: boolean
  folio?: string
  decisionRegistrada?: string
  resolucionFinal?: string
  estadoSolicitud?: string
  errors?: string[]
  error?: string
}

// =============================================================================
// MODELO DE DATOS — Gestión IC (portal de proyectos corporativos)
// -----------------------------------------------------------------------------
// Todo lo que sigue es el modelo de datos del frontend para el módulo nuevo de
// "Gestión de proyectos" (roles Usuario / Líder / Administrador, portal del
// solicitante, seguimiento, evidencias, aprobaciones y auditoría).
//
// Es un módulo INDEPENDIENTE del flujo PBI-01..07 de arriba: ese flujo sigue
// hablando con los webhooks reales de n8n/Airtable sin ningún cambio. Este
// módulo nuevo, en su primera versión, opera en MODO DEMO sobre
// src/lib/demoStore.ts (localStorage) — ver ese archivo y el README para el
// contrato propuesto de payloads si se decide conectarlo a n8n más adelante.
// =============================================================================

export type Role = 'usuario' | 'lider' | 'admin'

export type Priority = 'Baja' | 'Media' | 'Alta' | 'Crítica'

/**
 * Catálogo centralizado de estados del ciclo de vida completo de una
 * iniciativa: desde que se solicita hasta que se cierra. Ver src/lib/catalog.ts
 * para el orden, colores y agrupación de cada estado.
 */
export type ProjectStatus =
  | 'Solicitud recibida'
  | 'En revisión'
  | 'Requiere ajustes'
  | 'Aprobada'
  | 'Rechazada'
  | 'Pendiente de asignación'
  | 'Asignada'
  | 'En planeación'
  | 'En ejecución'
  | 'Bloqueada'
  | 'En validación'
  | 'Finalizada'
  | 'Cancelada'

export interface Area {
  id: string
  nombre: string
  descripcion?: string
  liderId?: string
  activa: boolean
  creadaEn: string
}

export interface User {
  id: string
  nombre: string
  correo: string
  rol: Role
  areaId: string
  puesto?: string
  activo: boolean
  avatarIniciales: string
  creadoEn: string
}

/**
 * Metadato ligero de un archivo cargado en modo demo. No se sube a ningún
 * storage real: solo se conserva nombre/tipo/tamaño y, si el navegador lo
 * permite, una vista previa local (data URL) que vive únicamente en memoria /
 * localStorage del navegador de quien hace la demo.
 */
export interface EvidenceRef {
  nombreArchivo: string
  tipo: string
  tamanoBytes: number
  previewUrl?: string
}

/** Solicitud de proyecto capturada por el portal del solicitante. */
export interface ProjectRequest {
  id: string
  folio: string
  nombreSolicitante: string
  correoSolicitante: string
  areaSolicitante: string
  nombreProyecto: string
  descripcion: string
  problemaONecesidad: string
  objetivo: string
  beneficioEsperado: string
  fechaInicioDeseada: string
  fechaTerminoEstimada: string
  prioridad: Priority
  areaResponsableSugerida: string
  archivosIniciales: EvidenceRef[]
  comentariosAdicionales?: string
  estado: ProjectStatus
  motivoRechazoOAjuste?: string
  creadoEn: string
  actualizadoEn: string
  proyectoId?: string
}

/** Proyecto activo (existe desde que una solicitud se asigna a un responsable). */
export interface Project {
  id: string
  folio: string
  requestId?: string
  nombre: string
  descripcion: string
  areaId: string
  liderId: string
  responsableId: string
  equipoIds: string[]
  prioridad: Priority
  estado: ProjectStatus
  fechaInicio: string
  fechaFinEstimada: string
  fechaFinReal?: string
  avance: number
  ultimaActualizacion: string
  bloqueado: boolean
  motivoBloqueo?: string
  creadoEn: string
}

export interface ProjectAssignment {
  id: string
  projectId: string
  userId: string
  rolEnProyecto: 'Responsable' | 'Colaborador'
  asignadoPorId: string
  asignadoEn: string
  activo: boolean
}

export interface ProgressUpdate {
  id: string
  projectId: string
  autorId: string
  fecha: string
  avance: number
  resumen: string
  bloqueado: boolean
  motivoBloqueo?: string
  evidenciaIds: string[]
}

export interface Evidence {
  id: string
  projectId: string
  progressUpdateId?: string
  nombreArchivo: string
  tipo: string
  tamanoBytes: number
  previewUrl?: string
  subidoPorId: string
  subidoEn: string
  validacion: 'Pendiente' | 'Validada' | 'Rechazada'
  validadoPorId?: string
  comentarioValidacion?: string
}

export interface Comment {
  id: string
  projectId: string
  autorId: string
  texto: string
  creadoEn: string
}

export interface StatusHistory {
  id: string
  entidad: 'ProjectRequest' | 'Project'
  entidadId: string
  fecha: string
  usuarioId: string
  estadoAnterior: string
  estadoNuevo: string
  comentario?: string
}

export interface Notification {
  id: string
  userId: string
  titulo: string
  mensaje: string
  tipo: 'info' | 'alerta' | 'exito' | 'error'
  leida: boolean
  creadaEn: string
  enlace?: string
}

export interface AuditEntry {
  id: string
  fecha: string
  usuarioId: string
  accion: string
  entidad: string
  entidadId: string
  detalle?: string
}
