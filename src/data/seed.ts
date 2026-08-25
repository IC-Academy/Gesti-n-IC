import type {
  Actividad,
  BitacoraEvento,
  Comentario,
  Configuracion,
  Evidencia,
  OtpRegistro,
  Proyecto,
  Solicitud,
  Usuario,
} from '../types'

// ============================================================================
// Datos semilla del "Modo demo". Reflejan exactamente los casos descritos en
// el brief del portal: usuarios de prueba, la solicitud SOL-2026-0001 ya
// convertida en el proyecto PRY-2026-0001, y sus tres actividades.
// ============================================================================

const now = '2026-08-24T09:00:00.000-06:00'

export const USUARIOS_SEED: Usuario[] = [
  {
    id: 'usr-90001',
    usuario: '90001',
    nombre: 'Administrador General',
    rol: 'ADMIN',
    correo: 'admin@intercon.com.mx',
    telefono: '5555550001',
    area: 'Dirección de Operaciones',
    activo: true,
    creadoEn: now,
    actualizadoEn: now,
  },
  {
    id: 'usr-20001',
    usuario: '20001',
    nombre: 'Diana López',
    rol: 'LIDER',
    correo: 'diana.lopez@intercon.com.mx',
    telefono: '5555550002',
    area: 'Inmuebles e Instalaciones',
    activo: true,
    creadoEn: now,
    actualizadoEn: now,
  },
  {
    id: 'usr-30001',
    usuario: '30001',
    nombre: 'Roberto Cabrera',
    rol: 'JEFE_MANTENIMIENTO',
    correo: 'roberto.cabrera@intercon.com.mx',
    telefono: '5555550003',
    area: 'Mantenimiento',
    activo: true,
    creadoEn: now,
    actualizadoEn: now,
  },
  {
    id: 'usr-10001',
    usuario: '10001',
    nombre: 'Juan Hernández',
    rol: 'PERSONAL_MANTENIMIENTO',
    telefono: '5555550004',
    area: 'Proveedor externo — Mantenimiento',
    activo: true,
    creadoEn: now,
    actualizadoEn: now,
  },
  {
    id: 'usr-10002',
    usuario: '10002',
    nombre: 'Marcos Ibarra',
    rol: 'PERSONAL_MANTENIMIENTO',
    telefono: '5555550005',
    area: 'Proveedor externo — Mantenimiento',
    activo: true,
    creadoEn: now,
    actualizadoEn: now,
  },
]

export const SOLICITUDES_SEED: Solicitud[] = [
  {
    id: 'sol-0001',
    folio: 'SOL-2026-0001',
    nombreCompleto: 'Solicitante Demo',
    area: 'Administración',
    correo: 'solicitante@intercon.com.mx',
    telefono: '5555551234',
    descripcion:
      'Adecuación del área de archivo: reparación de iluminación, pintura y revisión de contactos eléctricos.',
    tiempoAproximado: 'S1_4',
    evidenciasIds: [],
    estatus: 'CONVERTIDA_PROYECTO',
    prioridad: 'MEDIA',
    otpConfirmado: true,
    dictamen:
      'Solicitud autorizada. El trabajo se ejecutará por etapas para no interrumpir la operación del área.',
    decididoPor: 'usr-20001',
    decididoEn: '2026-08-23T12:00:00.000-06:00',
    proyectoId: 'pry-0001',
    creadoEn: '2026-08-20T10:15:00.000-06:00',
    actualizadoEn: '2026-08-23T12:00:00.000-06:00',
  },
]

export const PROYECTOS_SEED: Proyecto[] = [
  {
    id: 'pry-0001',
    folio: 'PRY-2026-0001',
    nombre: 'Adecuación del área de archivo',
    solicitudId: 'sol-0001',
    estatus: 'EN_PROCESO',
    prioridad: 'MEDIA',
    responsableId: 'usr-30001',
    fechaInicio: '2026-08-24',
    fechaFinPlaneada: '2026-09-12',
    avance: 35,
    presupuestoEstimado: 18500,
    ubicacion: 'Oficinas corporativas - Área de archivo',
    creadoPor: 'usr-20001',
    creadoEn: '2026-08-23T12:00:00.000-06:00',
    actualizadoEn: '2026-08-25T08:00:00.000-06:00',
  },
]

export const ACTIVIDADES_SEED: Actividad[] = [
  {
    id: 'act-0001',
    folio: 'ACT-0001',
    proyectoId: 'pry-0001',
    nombre: 'Inspección y levantamiento',
    descripcion: 'Levantamiento de condiciones actuales de iluminación, pintura e instalación eléctrica.',
    estatus: 'COMPLETADA',
    prioridad: 'MEDIA',
    peso: 20,
    avance: 100,
    responsableId: 'usr-30001',
    equipoIds: [],
    fechaInicio: '2026-08-24',
    fechaFin: '2026-08-25',
    creadoEn: '2026-08-23T12:05:00.000-06:00',
    actualizadoEn: '2026-08-25T08:00:00.000-06:00',
  },
  {
    id: 'act-0002',
    folio: 'ACT-0002',
    proyectoId: 'pry-0001',
    nombre: 'Reparación eléctrica',
    descripcion: 'Revisión y reparación de contactos e iluminación del área de archivo.',
    estatus: 'EN_PROCESO',
    prioridad: 'ALTA',
    peso: 40,
    avance: 50,
    responsableId: 'usr-10001',
    equipoIds: ['usr-10002'],
    fechaInicio: '2026-08-26',
    fechaFin: '2026-09-02',
    creadoEn: '2026-08-23T12:10:00.000-06:00',
    actualizadoEn: '2026-08-25T08:00:00.000-06:00',
  },
  {
    id: 'act-0003',
    folio: 'ACT-0003',
    proyectoId: 'pry-0001',
    nombre: 'Pintura y acabados',
    descripcion: 'Pintura general del área y acabados finales posteriores a la reparación eléctrica.',
    estatus: 'PENDIENTE',
    prioridad: 'MEDIA',
    peso: 40,
    avance: 0,
    responsableId: 'usr-10001',
    equipoIds: [],
    fechaInicio: '2026-09-03',
    fechaFin: '2026-09-11',
    creadoEn: '2026-08-23T12:12:00.000-06:00',
    actualizadoEn: '2026-08-23T12:12:00.000-06:00',
  },
]

export const EVIDENCIAS_SEED: Evidencia[] = [
  {
    id: 'evd-0001',
    nombre: 'levantamiento-inicial.jpg',
    url: '',
    tipo: 'image/jpeg',
    actividadId: 'act-0001',
    proyectoId: 'pry-0001',
    subidoPor: 'usr-30001',
    visibilidad: 'SOLICITANTE',
    creadoEn: '2026-08-25T07:30:00.000-06:00',
  },
]

export const COMENTARIOS_SEED: Comentario[] = [
  {
    id: 'cmt-0001',
    texto:
      'Su solicitud fue autorizada y convertida en el proyecto PRY-2026-0001. El trabajo se realizará por etapas.',
    autorTipo: 'SOLICITANTE',
    autorId: 'usr-20001',
    autorNombre: 'Diana López',
    solicitudId: 'sol-0001',
    creadoEn: '2026-08-23T12:01:00.000-06:00',
  },
  {
    id: 'cmt-0002',
    texto: 'Se concluyó el levantamiento de condiciones. Iniciamos con la parte eléctrica.',
    autorTipo: 'SOLICITANTE',
    autorId: 'usr-30001',
    autorNombre: 'Roberto Cabrera',
    proyectoId: 'pry-0001',
    creadoEn: '2026-08-25T08:05:00.000-06:00',
  },
  {
    id: 'cmt-0003',
    texto: 'Avance al 50% en contactos del ala norte. Continuamos mañana con iluminación.',
    autorTipo: 'INTERNO',
    autorId: 'usr-10001',
    autorNombre: 'Juan Hernández',
    actividadId: 'act-0002',
    creadoEn: '2026-08-25T08:10:00.000-06:00',
  },
]

export const OTP_SEED: OtpRegistro[] = []

export const BITACORA_SEED: BitacoraEvento[] = [
  {
    id: 'bit-0001',
    actorId: 'usr-20001',
    actorNombre: 'Diana López',
    accion: 'DECISION_SOLICITUD',
    detalle: 'Autorizó la solicitud SOL-2026-0001 y generó el proyecto PRY-2026-0001.',
    entidad: 'solicitud',
    entidadId: 'sol-0001',
    fecha: '2026-08-23T12:00:00.000-06:00',
  },
  {
    id: 'bit-0002',
    actorId: 'usr-30001',
    actorNombre: 'Roberto Cabrera',
    accion: 'ACTIVIDAD_COMPLETADA',
    detalle: 'Marcó ACT-0001 (Inspección y levantamiento) como completada.',
    entidad: 'actividad',
    entidadId: 'act-0001',
    fecha: '2026-08-25T08:00:00.000-06:00',
  },
]

export const CONFIGURACION_SEED: Configuracion[] = [
  { clave: 'otp.codigo_demo', valor: '123456', descripcion: 'Código OTP fijo utilizado en modo demo.' },
  { clave: 'otp.vigencia_minutos', valor: '10', descripcion: 'Minutos de vigencia de un código OTP.' },
  {
    clave: 'correo.dominios_validos',
    valor: '@intercon.com.mx,@icsecurity.com',
    descripcion: 'Dominios institucionales aceptados en el formulario público.',
  },
  { clave: 'organizacion.nombre', valor: 'Gestión IC — Inmuebles e Instalaciones' },
]
