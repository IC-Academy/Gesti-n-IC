// "Base de datos" de demostración para el módulo de Gestión de Proyectos.
//
// No hay backend propio todavía para este módulo (a diferencia del flujo
// PBI-01..07, que sí habla con n8n/Airtable reales). Mientras tanto, todo el
// estado vive aquí: se siembra la primera vez con datos de ejemplo realistas
// y luego se persiste en localStorage del navegador, así que las acciones que
// se hacen durante una demo (registrar avance, aprobar una solicitud, subir
// una evidencia, etc.) sí "se quedan" mientras no se borre el navegador.
//
// Cuando exista un backend real para este módulo, este archivo se sustituye
// por llamadas a esa API sin tener que tocar las pantallas: todas consumen
// los datos a través de useDemoStore() y de las funciones exportadas de aquí.

import { useSyncExternalStore } from 'react'
import type {
  Area,
  AuditEntry,
  Comment,
  Evidence,
  EvidenceRef,
  Notification,
  Priority,
  Project,
  ProjectAssignment,
  ProjectRequest,
  ProjectStatus,
  ProgressUpdate,
  Role,
  StatusHistory,
  User,
} from './types'
import { TRANSICIONES_PERMITIDAS } from './catalog'

export interface DemoState {
  areas: Area[]
  users: User[]
  requests: ProjectRequest[]
  projects: Project[]
  assignments: ProjectAssignment[]
  progressUpdates: ProgressUpdate[]
  evidences: Evidence[]
  comments: Comment[]
  statusHistory: StatusHistory[]
  notifications: Notification[]
  audit: AuditEntry[]
}

const STORAGE_KEY = 'gestion_ic_demo_v1'

// ---------------------------------------------------------------------------
// Utilidades de fecha / id
// ---------------------------------------------------------------------------
function isoOffset(days: number, fromIso?: string): string {
  const base = fromIso ? new Date(fromIso) : new Date()
  base.setDate(base.getDate() + days)
  return base.toISOString()
}

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter.toString().padStart(4, '0')}`
}

let folioSeqSol = 1000
let folioSeqPry = 1000

/**
 * Cuando el estado se recupera de localStorage (en vez de sembrarse de cero),
 * los contadores de id/folio deben continuar después del máximo ya usado, o
 * las siguientes acciones (crear solicitud, asignar proyecto, etc.) generarían
 * ids/folios duplicados que ya existen en los datos cargados.
 */
function sincronizarContadores(s: DemoState) {
  const todosLosIds = [
    ...s.areas.map((a) => a.id),
    ...s.users.map((u) => u.id),
    ...s.requests.map((r) => r.id),
    ...s.projects.map((p) => p.id),
    ...s.assignments.map((a) => a.id),
    ...s.progressUpdates.map((p) => p.id),
    ...s.evidences.map((e) => e.id),
    ...s.comments.map((c) => c.id),
    ...s.statusHistory.map((h) => h.id),
    ...s.notifications.map((n) => n.id),
    ...s.audit.map((a) => a.id),
  ]
  let maxId = 0
  for (const id of todosLosIds) {
    const m = id.match(/-(\d+)$/)
    if (m) maxId = Math.max(maxId, parseInt(m[1], 10))
  }
  idCounter = Math.max(idCounter, maxId)

  const folioNum = (folioStr: string) => {
    const m = folioStr.match(/(\d{4})$/)
    return m ? parseInt(m[1], 10) : 0
  }
  folioSeqSol = Math.max(folioSeqSol, ...s.requests.map((r) => folioNum(r.folio)), 1000)
  folioSeqPry = Math.max(folioSeqPry, ...s.projects.map((p) => folioNum(p.folio)), 1000)
}

function folio(prefix: 'SOL' | 'PRY', n: number): string {
  const year = new Date().getFullYear()
  return `GIC-${prefix}-${year}-${n.toString().padStart(4, '0')}`
}

// ---------------------------------------------------------------------------
// Semilla de datos
// ---------------------------------------------------------------------------
function seed(): DemoState {
  idCounter = 0

  const areas: Area[] = [
    { id: 'area-bi', nombre: 'Inteligencia de Negocios', descripcion: 'Datos, reportes y automatizaciones.', liderId: 'user-lider-bi', activa: true, creadaEn: isoOffset(-400) },
    { id: 'area-ops', nombre: 'Operaciones', descripcion: 'Procesos operativos y logística.', liderId: 'user-lider-ops', activa: true, creadaEn: isoOffset(-400) },
    { id: 'area-nom', nombre: 'Nóminas', descripcion: 'Pago y administración de personal.', liderId: undefined, activa: true, creadaEn: isoOffset(-400) },
    { id: 'area-dir', nombre: 'Dirección de Tecnología', descripcion: 'Gobierno de proyectos y tecnología.', liderId: undefined, activa: true, creadaEn: isoOffset(-400) },
  ]

  const users: User[] = [
    { id: 'user-admin', nombre: 'Andrea Bautista', correo: 'andrea.bautista@iccorp-demo.mx', rol: 'admin', areaId: 'area-dir', puesto: 'Directora de Gobierno de Proyectos', activo: true, avatarIniciales: 'AB', creadoEn: isoOffset(-400) },
    { id: 'user-lider-bi', nombre: 'Jorge Mejía', correo: 'jorge.mejia@iccorp-demo.mx', rol: 'lider', areaId: 'area-bi', puesto: 'Líder de Inteligencia de Negocios', activo: true, avatarIniciales: 'JM', creadoEn: isoOffset(-380) },
    { id: 'user-lider-ops', nombre: 'Patricia Solís', correo: 'patricia.solis@iccorp-demo.mx', rol: 'lider', areaId: 'area-ops', puesto: 'Líder de Operaciones', activo: true, avatarIniciales: 'PS', creadoEn: isoOffset(-380) },
    { id: 'user-usr-1', nombre: 'Daniela Juárez', correo: 'daniela.juarez@iccorp-demo.mx', rol: 'usuario', areaId: 'area-bi', puesto: 'Analista de Datos', activo: true, avatarIniciales: 'DJ', creadoEn: isoOffset(-360) },
    { id: 'user-usr-2', nombre: 'Ricardo Nava', correo: 'ricardo.nava@iccorp-demo.mx', rol: 'usuario', areaId: 'area-bi', puesto: 'Desarrollador BI', activo: true, avatarIniciales: 'RN', creadoEn: isoOffset(-340) },
    { id: 'user-usr-3', nombre: 'Manuel Ortega', correo: 'manuel.ortega@iccorp-demo.mx', rol: 'usuario', areaId: 'area-ops', puesto: 'Coordinador de Operaciones', activo: true, avatarIniciales: 'MO', creadoEn: isoOffset(-340) },
    { id: 'user-usr-4', nombre: 'Sofía Camacho', correo: 'sofia.camacho@iccorp-demo.mx', rol: 'usuario', areaId: 'area-ops', puesto: 'Analista de Procesos', activo: true, avatarIniciales: 'SC', creadoEn: isoOffset(-300) },
    { id: 'user-usr-5', nombre: 'Frances Aviña', correo: 'frances.avina@iccorp-demo.mx', rol: 'usuario', areaId: 'area-nom', puesto: 'Especialista de Nómina', activo: true, avatarIniciales: 'FA', creadoEn: isoOffset(-300) },
  ]

  const projects: Project[] = []
  const requests: ProjectRequest[] = []
  const assignments: ProjectAssignment[] = []
  const progressUpdates: ProgressUpdate[] = []
  const evidences: Evidence[] = []
  const comments: Comment[] = []
  const statusHistory: StatusHistory[] = []
  const notifications: Notification[] = []
  const audit: AuditEntry[] = []

  function pushHistory(entidad: 'ProjectRequest' | 'Project', entidadId: string, fecha: string, usuarioId: string, anterior: string, nuevo: string, comentario?: string) {
    statusHistory.push({ id: nextId('hist'), entidad, entidadId, fecha, usuarioId, estadoAnterior: anterior, estadoNuevo: nuevo, comentario })
  }

  function pushAudit(fecha: string, usuarioId: string, accion: string, entidad: string, entidadId: string, detalle?: string) {
    audit.push({ id: nextId('aud'), fecha, usuarioId, accion, entidad, entidadId, detalle })
  }

  function pushNotif(userId: string, titulo: string, mensaje: string, tipo: Notification['tipo'], fecha: string, leida: boolean, enlace?: string) {
    notifications.push({ id: nextId('notif'), userId, titulo, mensaje, tipo, leida, creadaEn: fecha, enlace })
  }

  // --- Proyectos ya asignados (con su solicitud de origen) -----------------
  interface Semilla {
    nombre: string
    descripcion: string
    areaId: string
    liderId: string
    responsableId: string
    equipoIds: string[]
    prioridad: Priority
    estado: ProjectStatus
    avance: number
    inicioHace: number
    finEnDias: number
    ultimaActualizacionHace: number
    bloqueado?: boolean
    motivoBloqueo?: string
    finReal?: boolean
  }

  const semillas: Semilla[] = [
    { nombre: 'Rediseño del Portal de Solicitudes BI', descripcion: 'Modernizar la captura y evaluación de solicitudes de Inteligencia de Negocios.', areaId: 'area-bi', liderId: 'user-lider-bi', responsableId: 'user-usr-1', equipoIds: ['user-usr-2'], prioridad: 'Alta', estado: 'En ejecución', avance: 62, inicioHace: 55, finEnDias: 40, ultimaActualizacionHace: 2 },
    { nombre: 'Automatización de Conciliación de Nómina Semanal', descripcion: 'Eliminar la conciliación manual entre el sistema de asistencia y la dispersión de nómina.', areaId: 'area-nom', liderId: 'user-lider-bi', responsableId: 'user-usr-5', equipoIds: [], prioridad: 'Alta', estado: 'En ejecución', avance: 48, inicioHace: 70, finEnDias: -6, ultimaActualizacionHace: 9 },
    { nombre: 'Modelo de Pronóstico de Rotación de Personal', descripcion: 'Modelo predictivo para anticipar rotación de personal por área.', areaId: 'area-bi', liderId: 'user-lider-bi', responsableId: 'user-usr-2', equipoIds: ['user-usr-1'], prioridad: 'Media', estado: 'Bloqueada', avance: 35, inicioHace: 48, finEnDias: 35, ultimaActualizacionHace: 6, bloqueado: true, motivoBloqueo: 'Falta acceso a la base histórica de Recursos Humanos (permiso pendiente de TI).' },
    { nombre: 'Optimización de Rutas de Distribución', descripcion: 'Reducir tiempos y costo de flete optimizando rutas de reparto.', areaId: 'area-ops', liderId: 'user-lider-ops', responsableId: 'user-usr-3', equipoIds: ['user-usr-4'], prioridad: 'Crítica', estado: 'En ejecución', avance: 81, inicioHace: 60, finEnDias: 6, ultimaActualizacionHace: 1 },
    { nombre: 'Tablero de Indicadores de Manufactura', descripcion: 'Tablero ejecutivo de OEE, mermas y cumplimiento de producción.', areaId: 'area-ops', liderId: 'user-lider-ops', responsableId: 'user-usr-4', equipoIds: [], prioridad: 'Media', estado: 'En validación', avance: 95, inicioHace: 66, finEnDias: 10, ultimaActualizacionHace: 1 },
    { nombre: 'Implementación de Firma Electrónica para Contratos', descripcion: 'Sustituir la firma en papel por firma electrónica en contratos y convenios.', areaId: 'area-dir', liderId: 'user-lider-bi', responsableId: 'user-admin', equipoIds: [], prioridad: 'Media', estado: 'En planeación', avance: 10, inicioHace: 8, finEnDias: 82, ultimaActualizacionHace: 3 },
    { nombre: 'Migración de Reportes Financieros a Power BI', descripcion: 'Migrar los reportes financieros mensuales de hojas de cálculo a Power BI.', areaId: 'area-bi', liderId: 'user-lider-bi', responsableId: 'user-usr-1', equipoIds: ['user-usr-2'], prioridad: 'Alta', estado: 'Finalizada', avance: 100, inicioHace: 130, finEnDias: -20, ultimaActualizacionHace: 20, finReal: true },
    { nombre: 'Programa de Bienestar y Capacitación Continua', descripcion: 'Plataforma para gestionar capacitaciones y bienestar del personal.', areaId: 'area-nom', liderId: 'user-lider-bi', responsableId: 'user-usr-5', equipoIds: [], prioridad: 'Baja', estado: 'Cancelada', avance: 20, inicioHace: 90, finEnDias: -30, ultimaActualizacionHace: 45 },
    { nombre: 'Sistema de Gestión de Turnos y Asistencia', descripcion: 'Sistema para programar turnos y controlar asistencia del personal de planta.', areaId: 'area-ops', liderId: 'user-lider-ops', responsableId: 'user-usr-3', equipoIds: ['user-usr-4'], prioridad: 'Media', estado: 'Asignada', avance: 0, inicioHace: 12, finEnDias: 78, ultimaActualizacionHace: 12 },
    { nombre: 'Panel de Analítica de Ventas en Tiempo Real', descripcion: 'Panel con indicadores de ventas actualizados en tiempo real por sucursal.', areaId: 'area-bi', liderId: 'user-lider-bi', responsableId: 'user-usr-2', equipoIds: [], prioridad: 'Alta', estado: 'En ejecución', avance: 55, inicioHace: 45, finEnDias: 33, ultimaActualizacionHace: 13 },
  ]

  semillas.forEach((s, i) => {
    const projectId = nextId('proj')
    const requestId = nextId('req')
    const n = i + 1
    const fInicioSolicitud = isoOffset(-(s.inicioHace + 18))
    const fRevision = isoOffset(-(s.inicioHace + 15))
    const fAprobacion = isoOffset(-(s.inicioHace + 10))
    const fAsignacion = isoOffset(-s.inicioHace)
    const fechaInicio = isoOffset(-s.inicioHace)
    const fechaFinEstimada = isoOffset(s.finEnDias)
    const ultimaActualizacion = isoOffset(-s.ultimaActualizacionHace)

    const request: ProjectRequest = {
      id: requestId,
      folio: folio('SOL', n),
      nombreSolicitante: users.find((u) => u.id === s.responsableId)?.nombre ?? 'Solicitante',
      correoSolicitante: users.find((u) => u.id === s.responsableId)?.correo ?? 'solicitante@iccorp-demo.mx',
      areaSolicitante: areas.find((a) => a.id === s.areaId)?.nombre ?? '',
      nombreProyecto: s.nombre,
      descripcion: s.descripcion,
      problemaONecesidad: `Actualmente el proceso relacionado con "${s.nombre}" se realiza de forma manual o dispersa, generando retrabajo y falta de visibilidad.`,
      objetivo: `Implementar "${s.nombre}" para estandarizar el proceso y contar con información confiable y oportuna.`,
      beneficioEsperado: 'Reducción de tiempo operativo, menos errores manuales y mejor toma de decisiones.',
      fechaInicioDeseada: fechaInicio,
      fechaTerminoEstimada: fechaFinEstimada,
      prioridad: s.prioridad,
      areaResponsableSugerida: areas.find((a) => a.id === s.areaId)?.nombre ?? '',
      archivosIniciales: [],
      comentariosAdicionales: undefined,
      estado: s.estado,
      creadoEn: fInicioSolicitud,
      actualizadoEn: fAsignacion,
      proyectoId: projectId,
    }
    requests.push(request)
    pushHistory('ProjectRequest', requestId, fInicioSolicitud, s.responsableId, '—', 'Solicitud recibida')
    pushHistory('ProjectRequest', requestId, fRevision, s.liderId, 'Solicitud recibida', 'En revisión')
    pushHistory('ProjectRequest', requestId, fAprobacion, s.liderId, 'En revisión', 'Aprobada', 'Solicitud viable, se autoriza para asignación.')
    pushHistory('ProjectRequest', requestId, fAprobacion, s.liderId, 'Aprobada', 'Pendiente de asignación')
    pushHistory('ProjectRequest', requestId, fAsignacion, s.liderId, 'Pendiente de asignación', 'Asignada', `Responsable asignado: ${users.find((u) => u.id === s.responsableId)?.nombre}.`)

    const project: Project = {
      id: projectId,
      folio: folio('PRY', n),
      requestId,
      nombre: s.nombre,
      descripcion: s.descripcion,
      areaId: s.areaId,
      liderId: s.liderId,
      responsableId: s.responsableId,
      equipoIds: s.equipoIds,
      prioridad: s.prioridad,
      estado: s.estado,
      fechaInicio,
      fechaFinEstimada,
      fechaFinReal: s.finReal ? isoOffset(s.finEnDias) : undefined,
      avance: s.avance,
      ultimaActualizacion,
      bloqueado: !!s.bloqueado,
      motivoBloqueo: s.motivoBloqueo,
      creadoEn: fAsignacion,
    }
    projects.push(project)

    assignments.push({ id: nextId('asig'), projectId, userId: s.responsableId, rolEnProyecto: 'Responsable', asignadoPorId: s.liderId, asignadoEn: fAsignacion, activo: true })
    s.equipoIds.forEach((uid) => {
      assignments.push({ id: nextId('asig'), projectId, userId: uid, rolEnProyecto: 'Colaborador', asignadoPorId: s.liderId, asignadoEn: fAsignacion, activo: true })
    })

    if (s.estado !== 'Asignada') {
      pushHistory('Project', projectId, isoOffset(-(s.inicioHace - 2)), s.liderId, 'Asignada', 'En planeación')
      if (s.estado !== 'En planeación') {
        pushHistory('Project', projectId, isoOffset(-(s.inicioHace - 5)), s.responsableId, 'En planeación', 'En ejecución')
      }
    }
    if (s.bloqueado) {
      pushHistory('Project', projectId, isoOffset(-(s.ultimaActualizacionHace + 1)), s.responsableId, 'En ejecución', 'Bloqueada', s.motivoBloqueo)
      pushNotif(s.liderId, 'Proyecto bloqueado', `"${s.nombre}" reportó un bloqueo: ${s.motivoBloqueo}`, 'alerta', isoOffset(-(s.ultimaActualizacionHace + 1)), s.ultimaActualizacionHace > 3)
    }
    if (s.estado === 'En validación') {
      pushHistory('Project', projectId, isoOffset(-(s.ultimaActualizacionHace)), s.responsableId, 'En ejecución', 'En validación')
      pushNotif(s.liderId, 'Evidencias por validar', `"${s.nombre}" está listo para validación de evidencias.`, 'info', isoOffset(-s.ultimaActualizacionHace), false)
    }
    if (s.estado === 'Finalizada') {
      pushHistory('Project', projectId, isoOffset(s.finEnDias), s.liderId, 'En validación', 'Finalizada', 'Entregables validados y aceptados.')
      pushNotif(s.responsableId, 'Proyecto finalizado', `"${s.nombre}" fue marcado como finalizado. ¡Buen trabajo!`, 'exito', isoOffset(s.finEnDias), true)
    }
    if (s.estado === 'Cancelada') {
      pushHistory('Project', projectId, isoOffset(-(s.ultimaActualizacionHace)), s.liderId, 'Bloqueada', 'Cancelada', 'Se reprioriza el portafolio del área; el proyecto se retoma más adelante.')
    }

    // Avances de ejemplo (1 a 3 por proyecto, según el avance acumulado)
    const numAvances = s.avance === 0 ? 0 : s.avance < 40 ? 1 : s.avance < 80 ? 2 : 3
    for (let a = 0; a < numAvances; a++) {
      const diasAtras = s.ultimaActualizacionHace + (numAvances - a - 1) * 12
      const avanceEnEseMomento = Math.round((s.avance / numAvances) * (a + 1))
      const updateId = nextId('upd')
      const fecha = isoOffset(-diasAtras)
      progressUpdates.push({
        id: updateId,
        projectId,
        autorId: s.responsableId,
        fecha,
        avance: Math.min(avanceEnEseMomento, s.avance),
        resumen:
          a === numAvances - 1
            ? `Última actualización: se completaron actividades clave de "${s.nombre}" y se documentó evidencia del avance.`
            : `Avance registrado en "${s.nombre}": actividades del plan completadas conforme a lo programado.`,
        bloqueado: a === numAvances - 1 && !!s.bloqueado,
        motivoBloqueo: a === numAvances - 1 ? s.motivoBloqueo : undefined,
        evidenciaIds: [],
      })
      if (a % 2 === 0) {
        const evId = nextId('ev')
        evidences.push({
          id: evId,
          projectId,
          progressUpdateId: updateId,
          nombreArchivo: `evidencia-${s.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${a + 1}.pdf`,
          tipo: 'application/pdf',
          tamanoBytes: 180_000 + a * 45_000,
          subidoPorId: s.responsableId,
          subidoEn: fecha,
          validacion: s.estado === 'Finalizada' || s.estado === 'En validación' ? 'Validada' : a === 0 ? 'Validada' : 'Pendiente',
          validadoPorId: s.estado === 'Finalizada' || (a === 0 && s.estado !== 'En validación') ? s.liderId : undefined,
        })
        progressUpdates[progressUpdates.length - 1].evidenciaIds.push(evId)
      }
    }

    if (i % 3 === 0) {
      comments.push({
        id: nextId('com'),
        projectId,
        autorId: s.liderId,
        texto: 'Buen avance, mantengamos la evidencia documentada semana a semana para no perder trazabilidad.',
        creadoEn: isoOffset(-Math.max(1, s.ultimaActualizacionHace - 1)),
      })
    }

    pushAudit(fAsignacion, s.liderId, 'Asignó proyecto', 'Project', projectId, `Responsable: ${users.find((u) => u.id === s.responsableId)?.nombre}`)
  })

  // --- Solicitudes que aún no se convierten en proyecto ---------------------
  const solicitudesExtra: Array<Pick<ProjectRequest, 'nombreProyecto' | 'descripcion' | 'areaResponsableSugerida' | 'estado' | 'prioridad' | 'nombreSolicitante' | 'correoSolicitante' | 'areaSolicitante'> & { comentario?: string }> = [
    { nombreProyecto: 'Chatbot interno de soporte de TI', descripcion: 'Asistente conversacional para resolver dudas frecuentes de sistemas y accesos.', areaResponsableSugerida: 'Dirección de Tecnología', areaSolicitante: 'Dirección de Tecnología', estado: 'Solicitud recibida', prioridad: 'Media', nombreSolicitante: 'Laura Higuera', correoSolicitante: 'laura.higuera@iccorp-demo.mx' },
    { nombreProyecto: 'Dashboard de Rotación de Inventario', descripcion: 'Panel para dar seguimiento a la rotación y obsolescencia de inventario.', areaResponsableSugerida: 'Operaciones', areaSolicitante: 'Operaciones', estado: 'En revisión', prioridad: 'Alta', nombreSolicitante: 'Carlos Peña', correoSolicitante: 'carlos.pena@iccorp-demo.mx' },
    { nombreProyecto: 'App móvil de checklist de calidad', descripcion: 'Aplicación móvil para checklists de calidad en planta.', areaResponsableSugerida: 'Operaciones', areaSolicitante: 'Operaciones', estado: 'Requiere ajustes', prioridad: 'Media', nombreSolicitante: 'Iván Torres', correoSolicitante: 'ivan.torres@iccorp-demo.mx', comentario: 'Falta precisar el alcance: ¿aplica a todas las plantas o solo a la planta piloto?' },
    { nombreProyecto: 'Integración CRM-ERP', descripcion: 'Sincronizar clientes y pedidos entre el CRM comercial y el ERP.', areaResponsableSugerida: 'Inteligencia de Negocios', areaSolicitante: 'Inteligencia de Negocios', estado: 'Rechazada', prioridad: 'Alta', nombreSolicitante: 'Miguel Ángel Ruiz', correoSolicitante: 'miguel.ruiz@iccorp-demo.mx', comentario: 'Ya existe una iniciativa activa que cubre este alcance (Rediseño del Portal de Solicitudes BI).' },
    { nombreProyecto: 'Portal de onboarding de nuevo ingreso', descripcion: 'Portal para automatizar el proceso de bienvenida de nuevos colaboradores.', areaResponsableSugerida: 'Nóminas', areaSolicitante: 'Nóminas', estado: 'Pendiente de asignación', prioridad: 'Media', nombreSolicitante: 'Frances Aviña', correoSolicitante: 'frances.avina@iccorp-demo.mx' },
  ]

  solicitudesExtra.forEach((s, i) => {
    const requestId = nextId('req')
    const n = semillas.length + i + 1
    const inicio = isoOffset(-(20 - i * 2))
    const req: ProjectRequest = {
      id: requestId,
      folio: folio('SOL', n),
      nombreSolicitante: s.nombreSolicitante,
      correoSolicitante: s.correoSolicitante,
      areaSolicitante: s.areaSolicitante,
      nombreProyecto: s.nombreProyecto,
      descripcion: s.descripcion,
      problemaONecesidad: `Se identificó una oportunidad de mejora relacionada con "${s.nombreProyecto}".`,
      objetivo: `Contar con una solución formal para "${s.nombreProyecto}".`,
      beneficioEsperado: 'Mejora en eficiencia operativa y trazabilidad del proceso.',
      fechaInicioDeseada: isoOffset(21),
      fechaTerminoEstimada: isoOffset(140),
      prioridad: s.prioridad,
      areaResponsableSugerida: s.areaResponsableSugerida,
      archivosIniciales: [],
      comentariosAdicionales: undefined,
      estado: s.estado,
      motivoRechazoOAjuste: s.comentario,
      creadoEn: inicio,
      actualizadoEn: isoOffset(-(20 - i * 2) + 3),
    }
    requests.push(req)
    pushHistory('ProjectRequest', requestId, inicio, 'sistema', '—', 'Solicitud recibida')
    if (s.estado !== 'Solicitud recibida') {
      pushHistory('ProjectRequest', requestId, isoOffset(-(20 - i * 2) + 1), 'user-lider-bi', 'Solicitud recibida', 'En revisión')
    }
    if (s.estado === 'Requiere ajustes' || s.estado === 'Rechazada' || s.estado === 'Pendiente de asignación') {
      pushHistory('ProjectRequest', requestId, isoOffset(-(20 - i * 2) + 3), 'user-lider-bi', 'En revisión', s.estado === 'Pendiente de asignación' ? 'Aprobada' : s.estado, s.comentario)
      if (s.estado === 'Pendiente de asignación') {
        pushHistory('ProjectRequest', requestId, isoOffset(-(20 - i * 2) + 3), 'user-lider-bi', 'Aprobada', 'Pendiente de asignación')
      }
    }
  })

  // --- Notificaciones adicionales -------------------------------------------
  pushNotif('user-usr-1', 'Nuevo comentario', 'Jorge Mejía comentó en "Rediseño del Portal de Solicitudes BI".', 'info', isoOffset(-1), false)
  pushNotif('user-usr-3', 'Recordatorio de avance', 'No has registrado avance en "Sistema de Gestión de Turnos y Asistencia" en 12 días.', 'alerta', isoOffset(-1), false)
  pushNotif('user-lider-bi', 'Solicitud nueva', 'Se recibió la solicitud "Chatbot interno de soporte de TI".', 'info', isoOffset(-2), true)
  pushNotif('user-lider-ops', 'Evidencia por validar', '"Tablero de Indicadores de Manufactura" tiene evidencia lista para validación.', 'info', isoOffset(-1), false)
  pushNotif('user-admin', 'Área sin líder', 'El área "Nóminas" no tiene un líder asignado.', 'alerta', isoOffset(-5), false)

  pushAudit(isoOffset(-400), 'user-admin', 'Creó área', 'Area', 'area-bi', 'Inteligencia de Negocios')
  pushAudit(isoOffset(-400), 'user-admin', 'Creó área', 'Area', 'area-ops', 'Operaciones')
  pushAudit(isoOffset(-400), 'user-admin', 'Creó área', 'Area', 'area-nom', 'Nóminas')
  pushAudit(isoOffset(-380), 'user-admin', 'Asignó líder de área', 'Area', 'area-bi', 'Jorge Mejía')
  pushAudit(isoOffset(-380), 'user-admin', 'Asignó líder de área', 'Area', 'area-ops', 'Patricia Solís')
  pushAudit(isoOffset(-30), 'user-admin', 'Creó usuario', 'User', 'user-usr-5', 'Frances Aviña (Nóminas)')

  return { areas, users, requests, projects, assignments, progressUpdates, evidences, comments, statusHistory, notifications, audit }
}

// ---------------------------------------------------------------------------
// Persistencia + store reactivo
// ---------------------------------------------------------------------------
function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (!parsed.areas || !parsed.users || !parsed.projects) return null
    return parsed
  } catch {
    return null
  }
}

function persist(s: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* localStorage no disponible o llena: la demo sigue funcionando solo en memoria */
  }
}

let state: DemoState = load() ?? seed()
sincronizarContadores(state)
if (!load()) persist(state)

const listeners = new Set<() => void>()
function emit() {
  persist(state)
  listeners.forEach((l) => l())
}
function setState(mutator: (draft: DemoState) => DemoState) {
  state = mutator(state)
  emit()
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function getSnapshot() {
  return state
}

export function useDemoStore(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getDemoState(): DemoState {
  return state
}

export function resetDemoData() {
  setState(() => {
    const nuevo = seed()
    sincronizarContadores(nuevo)
    return nuevo
  })
}

// ---------------------------------------------------------------------------
// Acciones (mutaciones)
// ---------------------------------------------------------------------------

export interface NuevaSolicitudInput {
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
}

export function crearSolicitud(input: NuevaSolicitudInput): ProjectRequest {
  folioSeqSol += 1
  const id = nextId('req')
  const ahora = new Date().toISOString()
  const req: ProjectRequest = {
    id,
    folio: folio('SOL', folioSeqSol),
    ...input,
    estado: 'Solicitud recibida',
    creadoEn: ahora,
    actualizadoEn: ahora,
  }
  setState((s) => ({
    ...s,
    requests: [req, ...s.requests],
    statusHistory: [
      ...s.statusHistory,
      { id: nextId('hist'), entidad: 'ProjectRequest', entidadId: id, fecha: ahora, usuarioId: 'publico', estadoAnterior: '—', estadoNuevo: 'Solicitud recibida', comentario: 'Registrada desde el portal del solicitante.' },
    ],
    notifications: [
      ...s.notifications,
      ...s.users
        .filter((u) => u.rol === 'lider' || u.rol === 'admin')
        .map((u) => ({ id: nextId('notif'), userId: u.id, titulo: 'Nueva solicitud de proyecto', mensaje: `"${req.nombreProyecto}" (${req.folio}) espera revisión.`, tipo: 'info' as const, leida: false, creadaEn: ahora })),
    ],
  }))
  return req
}

export function buscarSolicitud(folioBuscado: string, correo: string): ProjectRequest | undefined {
  return state.requests.find(
    (r) => r.folio.trim().toLowerCase() === folioBuscado.trim().toLowerCase() && r.correoSolicitante.trim().toLowerCase() === correo.trim().toLowerCase(),
  )
}

export function cambiarEstadoSolicitud(requestId: string, nuevoEstado: ProjectStatus, usuarioId: string, comentario?: string) {
  const ahora = new Date().toISOString()
  setState((s) => {
    const req = s.requests.find((r) => r.id === requestId)
    if (!req) return s
    const anterior = req.estado
    if (!TRANSICIONES_PERMITIDAS[anterior].includes(nuevoEstado)) return s
    return {
      ...s,
      requests: s.requests.map((r) => (r.id === requestId ? { ...r, estado: nuevoEstado, motivoRechazoOAjuste: comentario ?? r.motivoRechazoOAjuste, actualizadoEn: ahora } : r)),
      statusHistory: [...s.statusHistory, { id: nextId('hist'), entidad: 'ProjectRequest', entidadId: requestId, fecha: ahora, usuarioId, estadoAnterior: anterior, estadoNuevo: nuevoEstado, comentario }],
      audit: [...s.audit, { id: nextId('aud'), fecha: ahora, usuarioId, accion: `Cambió estado de solicitud a "${nuevoEstado}"`, entidad: 'ProjectRequest', entidadId: requestId, detalle: comentario }],
    }
  })
}

export interface AsignarProyectoInput {
  requestId: string
  liderId: string
  responsableId: string
  equipoIds: string[]
  fechaInicio: string
  fechaFinEstimada: string
  prioridad: Priority
  areaId: string
}

export function asignarProyectoDesdeSolicitud(input: AsignarProyectoInput): Project {
  folioSeqPry += 1
  const projectId = nextId('proj')
  const ahora = new Date().toISOString()
  const req = state.requests.find((r) => r.id === input.requestId)
  const project: Project = {
    id: projectId,
    folio: folio('PRY', folioSeqPry),
    requestId: input.requestId,
    nombre: req?.nombreProyecto ?? 'Proyecto sin nombre',
    descripcion: req?.descripcion ?? '',
    areaId: input.areaId,
    liderId: input.liderId,
    responsableId: input.responsableId,
    equipoIds: input.equipoIds,
    prioridad: input.prioridad,
    estado: 'Asignada',
    fechaInicio: input.fechaInicio,
    fechaFinEstimada: input.fechaFinEstimada,
    avance: 0,
    ultimaActualizacion: ahora,
    bloqueado: false,
    creadoEn: ahora,
  }
  setState((s) => ({
    ...s,
    projects: [project, ...s.projects],
    requests: s.requests.map((r) => (r.id === input.requestId ? { ...r, estado: 'Asignada', proyectoId: projectId, actualizadoEn: ahora } : r)),
    assignments: [
      ...s.assignments,
      { id: nextId('asig'), projectId, userId: input.responsableId, rolEnProyecto: 'Responsable', asignadoPorId: input.liderId, asignadoEn: ahora, activo: true },
      ...input.equipoIds.map((uid) => ({ id: nextId('asig'), projectId, userId: uid, rolEnProyecto: 'Colaborador' as const, asignadoPorId: input.liderId, asignadoEn: ahora, activo: true })),
    ],
    statusHistory: [
      ...s.statusHistory,
      { id: nextId('hist'), entidad: 'ProjectRequest', entidadId: input.requestId, fecha: ahora, usuarioId: input.liderId, estadoAnterior: req?.estado ?? 'Pendiente de asignación', estadoNuevo: 'Asignada', comentario: 'Se asignó responsable y equipo.' },
      { id: nextId('hist'), entidad: 'Project', entidadId: projectId, fecha: ahora, usuarioId: input.liderId, estadoAnterior: '—', estadoNuevo: 'Asignada' },
    ],
    notifications: [
      ...s.notifications,
      { id: nextId('notif'), userId: input.responsableId, titulo: 'Nuevo proyecto asignado', mensaje: `Se te asignó como responsable de "${project.nombre}".`, tipo: 'info', leida: false, creadaEn: ahora },
      ...input.equipoIds.map((uid) => ({ id: nextId('notif'), userId: uid, titulo: 'Nuevo proyecto asignado', mensaje: `Fuiste agregado al equipo de "${project.nombre}".`, tipo: 'info' as const, leida: false, creadaEn: ahora })),
    ],
    audit: [...s.audit, { id: nextId('aud'), fecha: ahora, usuarioId: input.liderId, accion: 'Asignó proyecto', entidad: 'Project', entidadId: projectId, detalle: `Responsable: ${input.responsableId}` }],
  }))
  return project
}

export function reasignarResponsable(projectId: string, nuevoResponsableId: string, usuarioId: string) {
  const ahora = new Date().toISOString()
  setState((s) => ({
    ...s,
    projects: s.projects.map((p) => (p.id === projectId ? { ...p, responsableId: nuevoResponsableId } : p)),
    assignments: [...s.assignments, { id: nextId('asig'), projectId, userId: nuevoResponsableId, rolEnProyecto: 'Responsable', asignadoPorId: usuarioId, asignadoEn: ahora, activo: true }],
    notifications: [...s.notifications, { id: nextId('notif'), userId: nuevoResponsableId, titulo: 'Reasignación de proyecto', mensaje: 'Ahora eres responsable de un proyecto.', tipo: 'info', leida: false, creadaEn: ahora }],
    audit: [...s.audit, { id: nextId('aud'), fecha: ahora, usuarioId, accion: 'Reasignó responsable', entidad: 'Project', entidadId: projectId, detalle: nuevoResponsableId }],
  }))
}

export function actualizarPlanProyecto(projectId: string, cambios: Partial<Pick<Project, 'fechaInicio' | 'fechaFinEstimada' | 'prioridad'>>, usuarioId: string) {
  setState((s) => ({
    ...s,
    projects: s.projects.map((p) => (p.id === projectId ? { ...p, ...cambios } : p)),
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId, accion: 'Actualizó plan del proyecto', entidad: 'Project', entidadId: projectId }],
  }))
}

export function cambiarEstadoProyecto(projectId: string, nuevoEstado: ProjectStatus, usuarioId: string, comentario?: string) {
  const ahora = new Date().toISOString()
  setState((s) => {
    const proj = s.projects.find((p) => p.id === projectId)
    if (!proj) return s
    const anterior = proj.estado
    if (!TRANSICIONES_PERMITIDAS[anterior].includes(nuevoEstado)) return s
    return {
      ...s,
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...p, estado: nuevoEstado, bloqueado: nuevoEstado === 'Bloqueada', ultimaActualizacion: ahora, fechaFinReal: nuevoEstado === 'Finalizada' ? ahora : p.fechaFinReal }
          : p,
      ),
      statusHistory: [...s.statusHistory, { id: nextId('hist'), entidad: 'Project', entidadId: projectId, fecha: ahora, usuarioId, estadoAnterior: anterior, estadoNuevo: nuevoEstado, comentario }],
      notifications: proj.responsableId
        ? [...s.notifications, { id: nextId('notif'), userId: proj.responsableId, titulo: 'Cambio de estado', mensaje: `"${proj.nombre}" cambió a "${nuevoEstado}".`, tipo: nuevoEstado === 'Cancelada' ? 'error' : nuevoEstado === 'Finalizada' ? 'exito' : 'info', leida: false, creadaEn: ahora }]
        : s.notifications,
      audit: [...s.audit, { id: nextId('aud'), fecha: ahora, usuarioId, accion: `Cambió estado de proyecto a "${nuevoEstado}"`, entidad: 'Project', entidadId: projectId, detalle: comentario }],
    }
  })
}

export interface RegistrarAvanceInput {
  projectId: string
  autorId: string
  avance: number
  resumen: string
  bloqueado: boolean
  motivoBloqueo?: string
  evidencias: EvidenceRef[]
}

export function registrarAvance(input: RegistrarAvanceInput) {
  const ahora = new Date().toISOString()
  const updateId = nextId('upd')
  const evidenciaIds: string[] = []
  setState((s) => {
    const proj = s.projects.find((p) => p.id === input.projectId)
    if (!proj) return s
    const nuevasEvidencias: Evidence[] = input.evidencias.map((e) => {
      const evId = nextId('ev')
      evidenciaIds.push(evId)
      return {
        id: evId,
        projectId: input.projectId,
        progressUpdateId: updateId,
        nombreArchivo: e.nombreArchivo,
        tipo: e.tipo,
        tamanoBytes: e.tamanoBytes,
        previewUrl: e.previewUrl,
        subidoPorId: input.autorId,
        subidoEn: ahora,
        validacion: 'Pendiente',
      }
    })
    const update: ProgressUpdate = {
      id: updateId,
      projectId: input.projectId,
      autorId: input.autorId,
      fecha: ahora,
      avance: input.avance,
      resumen: input.resumen,
      bloqueado: input.bloqueado,
      motivoBloqueo: input.motivoBloqueo,
      evidenciaIds,
    }
    const nuevoEstado: ProjectStatus = input.bloqueado ? 'Bloqueada' : proj.estado === 'Bloqueada' ? 'En ejecución' : proj.estado === 'Asignada' ? 'En ejecución' : proj.estado
    const cambioEstado = nuevoEstado !== proj.estado

    return {
      ...s,
      progressUpdates: [update, ...s.progressUpdates],
      evidences: [...s.evidences, ...nuevasEvidencias],
      projects: s.projects.map((p) =>
        p.id === input.projectId ? { ...p, avance: input.avance, ultimaActualizacion: ahora, estado: nuevoEstado, bloqueado: input.bloqueado, motivoBloqueo: input.motivoBloqueo } : p,
      ),
      statusHistory: cambioEstado
        ? [...s.statusHistory, { id: nextId('hist'), entidad: 'Project', entidadId: input.projectId, fecha: ahora, usuarioId: input.autorId, estadoAnterior: proj.estado, estadoNuevo: nuevoEstado, comentario: input.bloqueado ? input.motivoBloqueo : 'Avance registrado por el responsable.' }]
        : s.statusHistory,
      notifications: input.bloqueado
        ? [...s.notifications, { id: nextId('notif'), userId: proj.liderId, titulo: 'Proyecto bloqueado', mensaje: `"${proj.nombre}" reportó un bloqueo: ${input.motivoBloqueo ?? 'sin detalle'}.`, tipo: 'alerta', leida: false, creadaEn: ahora }]
        : [...s.notifications, { id: nextId('notif'), userId: proj.liderId, titulo: 'Nuevo avance registrado', mensaje: `"${proj.nombre}" registró ${input.avance}% de avance.`, tipo: 'info', leida: false, creadaEn: ahora }],
    }
  })
}

export function agregarEvidencia(projectId: string, autorId: string, archivos: EvidenceRef[]) {
  const ahora = new Date().toISOString()
  setState((s) => {
    const proj = s.projects.find((p) => p.id === projectId)
    const nuevas: Evidence[] = archivos.map((e) => ({
      id: nextId('ev'),
      projectId,
      nombreArchivo: e.nombreArchivo,
      tipo: e.tipo,
      tamanoBytes: e.tamanoBytes,
      previewUrl: e.previewUrl,
      subidoPorId: autorId,
      subidoEn: ahora,
      validacion: 'Pendiente',
    }))
    return {
      ...s,
      evidences: [...s.evidences, ...nuevas],
      notifications: proj ? [...s.notifications, { id: nextId('notif'), userId: proj.liderId, titulo: 'Nueva evidencia cargada', mensaje: `Se agregaron ${archivos.length} evidencia(s) a "${proj.nombre}".`, tipo: 'info', leida: false, creadaEn: ahora }] : s.notifications,
    }
  })
}

export function agregarComentario(projectId: string, texto: string, autorId: string) {
  const ahora = new Date().toISOString()
  setState((s) => ({
    ...s,
    comments: [...s.comments, { id: nextId('com'), projectId, autorId, texto, creadoEn: ahora }],
  }))
}

export function validarEvidencia(evidenceId: string, decision: 'Validada' | 'Rechazada', usuarioId: string, comentario?: string) {
  const ahora = new Date().toISOString()
  setState((s) => {
    const ev = s.evidences.find((e) => e.id === evidenceId)
    if (!ev) return s
    const proj = s.projects.find((p) => p.id === ev.projectId)
    return {
      ...s,
      evidences: s.evidences.map((e) => (e.id === evidenceId ? { ...e, validacion: decision, validadoPorId: usuarioId, comentarioValidacion: comentario } : e)),
      notifications: proj ? [...s.notifications, { id: nextId('notif'), userId: proj.responsableId, titulo: `Evidencia ${decision.toLowerCase()}`, mensaje: `Tu evidencia "${ev.nombreArchivo}" fue ${decision.toLowerCase()}.`, tipo: decision === 'Validada' ? 'exito' : 'error', leida: false, creadaEn: ahora }] : s.notifications,
      audit: [...s.audit, { id: nextId('aud'), fecha: ahora, usuarioId, accion: `${decision === 'Validada' ? 'Validó' : 'Rechazó'} evidencia`, entidad: 'Evidence', entidadId: evidenceId, detalle: comentario }],
    }
  })
}

export function marcarNotificacionLeida(id: string) {
  setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, leida: true } : n)) }))
}

export function marcarTodasLeidas(userId: string) {
  setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, leida: true } : n)) }))
}

// --- Administración: usuarios / áreas -------------------------------------
export function crearUsuario(input: Omit<User, 'id' | 'creadoEn' | 'avatarIniciales'>, actorId: string): User {
  const id = nextId('user')
  const iniciales = input.nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const nuevo: User = { ...input, id, avatarIniciales: iniciales, creadoEn: new Date().toISOString() }
  setState((s) => ({
    ...s,
    users: [...s.users, nuevo],
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: 'Creó usuario', entidad: 'User', entidadId: id, detalle: `${input.nombre} (${input.rol})` }],
  }))
  return nuevo
}

export function actualizarUsuario(userId: string, cambios: Partial<Pick<User, 'nombre' | 'correo' | 'puesto' | 'activo'>>, actorId: string) {
  setState((s) => ({
    ...s,
    users: s.users.map((u) => (u.id === userId ? { ...u, ...cambios } : u)),
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: cambios.activo === false ? 'Desactivó usuario' : cambios.activo === true ? 'Activó usuario' : 'Editó usuario', entidad: 'User', entidadId: userId }],
  }))
}

export function asignarRol(userId: string, rol: Role, actorId: string) {
  setState((s) => ({
    ...s,
    users: s.users.map((u) => (u.id === userId ? { ...u, rol } : u)),
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: `Cambió rol a "${rol}"`, entidad: 'User', entidadId: userId }],
  }))
}

export function cambiarAreaUsuario(userId: string, areaId: string, actorId: string) {
  setState((s) => ({
    ...s,
    users: s.users.map((u) => (u.id === userId ? { ...u, areaId } : u)),
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: 'Cambió de área', entidad: 'User', entidadId: userId, detalle: areaId }],
  }))
}

export function crearArea(input: Omit<Area, 'id' | 'creadaEn'>, actorId: string): Area {
  const id = nextId('area')
  const nueva: Area = { ...input, id, creadaEn: new Date().toISOString() }
  setState((s) => ({
    ...s,
    areas: [...s.areas, nueva],
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: 'Creó área', entidad: 'Area', entidadId: id, detalle: input.nombre }],
  }))
  return nueva
}

export function actualizarArea(areaId: string, cambios: Partial<Pick<Area, 'nombre' | 'descripcion' | 'activa'>>, actorId: string) {
  setState((s) => ({
    ...s,
    areas: s.areas.map((a) => (a.id === areaId ? { ...a, ...cambios } : a)),
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: 'Editó área', entidad: 'Area', entidadId: areaId }],
  }))
}

export function asignarLiderArea(areaId: string, liderId: string | undefined, actorId: string) {
  setState((s) => ({
    ...s,
    areas: s.areas.map((a) => (a.id === areaId ? { ...a, liderId } : a)),
    audit: [...s.audit, { id: nextId('aud'), fecha: new Date().toISOString(), usuarioId: actorId, accion: liderId ? 'Asignó líder de área' : 'Quitó líder de área', entidad: 'Area', entidadId: areaId, detalle: liderId }],
  }))
}
