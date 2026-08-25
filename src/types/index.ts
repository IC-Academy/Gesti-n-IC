// ============================================================================
// Tipos de dominio — Gestión IC · Inmuebles e Instalaciones
// Reflejan la estructura de la base de Airtable "Gestión IC - Inmuebles e
// Instalaciones DEMO" (app5gtkQcig0zk4L4), tabla por tabla.
// ============================================================================

export type Rol =
  | 'ADMIN'
  | 'LIDER'
  | 'JEFE_MANTENIMIENTO'
  | 'PERSONAL_MANTENIMIENTO'

export const ROLES: Rol[] = ['ADMIN', 'LIDER', 'JEFE_MANTENIMIENTO', 'PERSONAL_MANTENIMIENTO']

export const ROL_LABEL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  LIDER: 'Líder',
  JEFE_MANTENIMIENTO: 'Jefe de mantenimiento',
  PERSONAL_MANTENIMIENTO: 'Personal de mantenimiento',
}

// ---- Tabla: Usuarios (tblSjcpr0L6IxkxA3) ----------------------------------
export interface Usuario {
  id: string
  usuario: string // clave de acceso, p. ej. "90001"
  nombre: string
  rol: Rol
  correo?: string
  telefono?: string
  area?: string
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

// ---- Tabla: Solicitudes (tblT6mUXBIYuzyomm) -------------------------------
export type EstatusSolicitud =
  | 'BORRADOR'
  | 'PENDIENTE_OTP'
  | 'RECIBIDA'
  | 'EN_REVISION'
  | 'AUTORIZADA'
  | 'RECHAZADA'
  | 'CANCELADA'
  | 'CONVERTIDA_PROYECTO'

export const ESTATUS_SOLICITUD_LABEL: Record<EstatusSolicitud, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_OTP: 'Pendiente de confirmación',
  RECIBIDA: 'Recibida',
  EN_REVISION: 'En revisión',
  AUTORIZADA: 'Autorizada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  CONVERTIDA_PROYECTO: 'Convertida en proyecto',
}

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
}

export type TiempoAproximado =
  | 'URGENTE_24H'
  | 'D1_3'
  | 'D4_7'
  | 'S1_4'
  | 'MAS_UN_MES'
  | 'NO_DETERMINADO'

export const TIEMPO_APROXIMADO_LABEL: Record<TiempoAproximado, string> = {
  URGENTE_24H: 'Urgente — menos de 24 horas',
  D1_3: '1 a 3 días',
  D4_7: '4 a 7 días',
  S1_4: '1 a 4 semanas',
  MAS_UN_MES: 'Más de un mes',
  NO_DETERMINADO: 'No determinado',
}

export interface Solicitud {
  id: string
  folio: string // "SOL-2026-0001"
  nombreCompleto: string
  area: string
  correo: string
  telefono: string
  descripcion: string
  tiempoAproximado: TiempoAproximado
  evidenciasIds: string[]
  estatus: EstatusSolicitud
  prioridad?: Prioridad
  otpConfirmado: boolean
  dictamen?: string
  decididoPor?: string
  decididoEn?: string
  proyectoId?: string
  creadoEn: string
  actualizadoEn: string
}

// ---- Tabla: Proyectos (tblg4bysF8hDao2RM) ---------------------------------
export type EstatusProyecto =
  | 'PLANEACION'
  | 'EN_PROCESO'
  | 'PAUSADO'
  | 'BLOQUEADO'
  | 'COMPLETADO'
  | 'CANCELADO'

export const ESTATUS_PROYECTO_LABEL: Record<EstatusProyecto, string> = {
  PLANEACION: 'Planeación',
  EN_PROCESO: 'En proceso',
  PAUSADO: 'Pausado',
  BLOQUEADO: 'Bloqueado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

export interface Proyecto {
  id: string
  folio: string // "PRY-2026-0001"
  nombre: string
  solicitudId?: string
  estatus: EstatusProyecto
  prioridad: Prioridad
  responsableId?: string
  fechaInicio: string
  fechaFinPlaneada: string
  fechaFinReal?: string
  avance: number // 0-100, calculado a partir de actividades
  presupuestoEstimado?: number
  ubicacion: string
  creadoPor?: string
  creadoEn: string
  actualizadoEn: string
}

// ---- Tabla: Actividades (tblAjLwamqFh8N6nf) -------------------------------
export type EstatusActividad =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'BLOQUEADA'
  | 'EN_VALIDACION'
  | 'COMPLETADA'
  | 'CANCELADA'

export const ESTATUS_ACTIVIDAD_LABEL: Record<EstatusActividad, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  BLOQUEADA: 'Bloqueada',
  EN_VALIDACION: 'En validación',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

export interface Actividad {
  id: string
  folio: string // "ACT-0001"
  proyectoId: string
  nombre: string
  descripcion?: string
  estatus: EstatusActividad
  prioridad: Prioridad
  peso: number // % de peso dentro del proyecto (0-100)
  avance: number // % de avance propio (0-100)
  responsableId?: string
  equipoIds: string[]
  fechaInicio?: string
  fechaFin?: string
  bloqueoMotivo?: string
  creadoEn: string
  actualizadoEn: string
}

// ---- Tabla: Evidencias (tblb9RL3DsAQbEtfF) --------------------------------
export type EvidenciaVisibilidad = 'INTERNA' | 'SOLICITANTE'

export interface Evidencia {
  id: string
  nombre: string
  url: string // data URL o referencia (demo)
  tipo: string // mime type aproximado
  solicitudId?: string
  actividadId?: string
  proyectoId?: string
  subidoPor?: string
  visibilidad: EvidenciaVisibilidad
  creadoEn: string
}

// ---- Tabla: Comentarios (tblkEHs2v6GAgATen) -------------------------------
export type ComentarioAutorTipo = 'SOLICITANTE' | 'INTERNO'

export interface Comentario {
  id: string
  texto: string
  autorTipo: ComentarioAutorTipo
  autorId?: string
  autorNombre: string
  solicitudId?: string
  actividadId?: string
  proyectoId?: string
  creadoEn: string
}

// ---- Tabla: OTP (tblXFYbpFKY89PfkO) ---------------------------------------
export type OtpProposito =
  | 'LOGIN'
  | 'CONFIRMAR_SOLICITUD'
  | 'CONSULTAR_ESTATUS'

export interface OtpRegistro {
  id: string
  destino: string // correo o teléfono enmascarado en UI
  proposito: OtpProposito
  codigo: string // en demo siempre "123456"
  referenciaId?: string // p.ej. folio de solicitud
  usado: boolean
  expiraEn: string
  creadoEn: string
}

// ---- Tabla: Bitácora (tblppClsStGYH8R58) ----------------------------------
export interface BitacoraEvento {
  id: string
  actorId?: string
  actorNombre: string
  accion: string
  detalle: string
  entidad?: string
  entidadId?: string
  fecha: string
}

// ---- Tabla: Configuración (tblT9l86EcktGWI6j) -----------------------------
export interface Configuracion {
  clave: string
  valor: string
  descripcion?: string
}

// ---- Paginación / respuestas genéricas de servicio ------------------------
export interface ServiceError {
  code: string
  message: string
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError }

export interface SesionUsuario {
  usuario: Usuario
  token: string
  emitidoEn: string
}

// Dominios válidos de correo institucional para solicitantes externos.
export const DOMINIOS_CORREO_VALIDOS = ['@intercon.com.mx', '@icsecurity.com'] as const
