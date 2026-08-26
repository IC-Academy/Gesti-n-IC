import type {
  EstatusSolicitud,
  Prioridad,
  ServiceResult,
  Solicitud,
  TiempoAproximado,
} from '../../types'
import { DOMINIOS_CORREO_VALIDOS } from '../../types'
import { delay, getDb, mutateDb, newId, nextFolioProyecto, nextFolioSolicitud, nowIso } from './db'
import { registrarBitacora } from './bitacora'
import { can } from '../../lib/permissions'
import type { Rol } from '../../types'

export interface NuevaSolicitudInput {
  nombreCompleto: string
  area: string
  correo: string
  telefono: string
  descripcion: string
  tiempoAproximado: TiempoAproximado
  evidenciasNombres?: string[]
}

export function correoValido(correo: string): boolean {
  const lower = correo.trim().toLowerCase()
  return DOMINIOS_CORREO_VALIDOS.some((dominio) => lower.endsWith(dominio))
}

async function iniciar(input: NuevaSolicitudInput): Promise<ServiceResult<{ solicitudId: string; folio: string }>> {
  if (!correoValido(input.correo)) {
    return delay({
      ok: false,
      error: {
        code: 'CORREO_INVALIDO',
        message: 'El correo debe pertenecer a @intercon.com.mx o @icsecurity.com.',
      },
    })
  }

  const { id, folio } = mutateDb((db) => {
    const folio = nextFolioSolicitud(db)
    const id = newId('sol')
    const evidenciasIds = (input.evidenciasNombres ?? []).map(() => newId('evd'))
    const solicitud: Solicitud = {
      id,
      folio,
      nombreCompleto: input.nombreCompleto.trim(),
      area: input.area.trim(),
      correo: input.correo.trim().toLowerCase(),
      telefono: input.telefono.trim(),
      descripcion: input.descripcion.trim(),
      tiempoAproximado: input.tiempoAproximado,
      evidenciasIds,
      estatus: 'PENDIENTE_OTP',
      otpConfirmado: false,
      creadoEn: nowIso(),
      actualizadoEn: nowIso(),
    }
    db.solicitudes.push(solicitud)
    ;(input.evidenciasNombres ?? []).forEach((nombre, indice) => {
      db.evidencias.push({
        id: evidenciasIds[indice],
        nombre,
        url: '',
        tipo: nombre.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/*',
        solicitudId: id,
        visibilidad: 'INTERNA',
        creadoEn: nowIso(),
      })
    })
    return { id, folio }
  })

  return delay({ ok: true, data: { solicitudId: id, folio } })
}

async function confirmar(solicitudId: string): Promise<ServiceResult<Solicitud>> {
  const db = getDb()
  const existente = db.solicitudes.find((s) => s.id === solicitudId)
  if (!existente) {
    return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'La solicitud no existe.' } })
  }

  const actualizada = mutateDb((db) => {
    const s = db.solicitudes.find((s) => s.id === solicitudId)!
    s.estatus = 'RECIBIDA'
    s.otpConfirmado = true
    s.actualizadoEn = nowIso()
    return { ...s }
  })

  registrarBitacora({
    actorNombre: actualizada.nombreCompleto,
    accion: 'SOLICITUD_CONFIRMADA',
    detalle: `Se confirmó y recibió la solicitud ${actualizada.folio}.`,
    entidad: 'solicitud',
    entidadId: actualizada.id,
  })

  return delay({ ok: true, data: actualizada })
}

async function listar(rol: Rol | undefined): Promise<ServiceResult<Solicitud[]>> {
  if (!can(rol, 'solicitudes.ver_todas')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para ver solicitudes.' } })
  }
  const db = getDb()
  const visibles = db.solicitudes
    .filter((s) => s.estatus !== 'BORRADOR' && s.estatus !== 'PENDIENTE_OTP')
    .sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1))
  return delay({ ok: true, data: visibles })
}

async function obtener(id: string, rol: Rol | undefined): Promise<ServiceResult<Solicitud>> {
  if (!can(rol, 'solicitudes.ver_todas')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para ver esta solicitud.' } })
  }
  const db = getDb()
  const s = db.solicitudes.find((s) => s.id === id)
  if (!s) return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'Solicitud no encontrada.' } })
  return delay({ ok: true, data: s })
}

export interface DecisionInput {
  decision: Extract<EstatusSolicitud, 'AUTORIZADA' | 'RECHAZADA' | 'CANCELADA'>
  dictamen: string
  actorId: string
  actorNombre: string
  proyecto?: {
    nombre: string
    prioridad: Prioridad
    responsableId?: string
    fechaInicio: string
    fechaFinPlaneada: string
    ubicacion: string
    presupuestoEstimado?: number
  }
}

async function decidir(id: string, rol: Rol | undefined, input: DecisionInput): Promise<ServiceResult<Solicitud>> {
  if (!can(rol, 'solicitudes.decidir')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para decidir sobre solicitudes.' } })
  }
  if (!input.dictamen.trim()) {
    return delay({ ok: false, error: { code: 'DICTAMEN_REQUERIDO', message: 'El dictamen es obligatorio.' } })
  }
  const db = getDb()
  const existente = db.solicitudes.find((s) => s.id === id)
  if (!existente) {
    return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'Solicitud no encontrada.' } })
  }
  if (existente.estatus === 'CONVERTIDA_PROYECTO' || existente.estatus === 'RECHAZADA' || existente.estatus === 'CANCELADA') {
    return delay({ ok: false, error: { code: 'ESTADO_INVALIDO', message: 'Esta solicitud ya fue resuelta.' } })
  }
  if (input.decision === 'AUTORIZADA' && !input.proyecto) {
    return delay({ ok: false, error: { code: 'PROYECTO_REQUERIDO', message: 'Debes capturar los datos del proyecto a crear.' } })
  }

  const resultado = mutateDb((db) => {
    const s = db.solicitudes.find((s) => s.id === id)!
    s.dictamen = input.dictamen.trim()
    s.decididoPor = input.actorId
    s.decididoEn = nowIso()
    s.actualizadoEn = nowIso()

    if (input.decision === 'AUTORIZADA' && input.proyecto) {
      const folioProyecto = nextFolioProyecto(db)
      const proyectoId = newId('pry')
      db.proyectos.push({
        id: proyectoId,
        folio: folioProyecto,
        nombre: input.proyecto.nombre.trim(),
        solicitudId: s.id,
        estatus: 'PLANEACION',
        prioridad: input.proyecto.prioridad,
        responsableId: input.proyecto.responsableId,
        fechaInicio: input.proyecto.fechaInicio,
        fechaFinPlaneada: input.proyecto.fechaFinPlaneada,
        avance: 0,
        presupuestoEstimado: input.proyecto.presupuestoEstimado,
        ubicacion: input.proyecto.ubicacion.trim(),
        creadoPor: input.actorId,
        creadoEn: nowIso(),
        actualizadoEn: nowIso(),
      })
      s.estatus = 'CONVERTIDA_PROYECTO'
      s.prioridad = input.proyecto.prioridad
      s.proyectoId = proyectoId
    } else {
      s.estatus = input.decision
    }

    db.comentarios.push({
      id: newId('cmt'),
      texto: s.dictamen!,
      autorTipo: 'SOLICITANTE',
      autorId: input.actorId,
      autorNombre: input.actorNombre,
      solicitudId: s.id,
      creadoEn: nowIso(),
    })

    return { ...s }
  })

  registrarBitacora({
    actorId: input.actorId,
    actorNombre: input.actorNombre,
    accion: 'DECISION_SOLICITUD',
    detalle: `${input.decision === 'AUTORIZADA' ? 'Autorizó' : input.decision === 'RECHAZADA' ? 'Rechazó' : 'Canceló'} la solicitud ${resultado.folio}.`,
    entidad: 'solicitud',
    entidadId: resultado.id,
  })

  return delay({ ok: true, data: resultado })
}

export interface ConsultaEstatusInput {
  folio: string
  correo: string
}

async function iniciarConsultaEstatus(input: ConsultaEstatusInput): Promise<ServiceResult<{ solicitudId: string }>> {
  const db = getDb()
  const s = db.solicitudes.find(
    (s) => s.folio.toLowerCase() === input.folio.trim().toLowerCase() && s.correo.toLowerCase() === input.correo.trim().toLowerCase(),
  )
  if (!s) {
    return delay({
      ok: false,
      error: { code: 'NO_ENCONTRADA', message: 'No encontramos una solicitud con ese folio y correo.' },
    })
  }
  return delay({ ok: true, data: { solicitudId: s.id } })
}

async function obtenerEstatusPublico(folio: string): Promise<ServiceResult<Solicitud>> {
  const db = getDb()
  const s = db.solicitudes.find((s) => s.folio.toLowerCase() === folio.trim().toLowerCase())
  if (!s) return delay({ ok: false, error: { code: 'NO_ENCONTRADA', message: 'Solicitud no encontrada.' } })
  return delay({ ok: true, data: s })
}

export const solicitudesDemo = {
  iniciar,
  confirmar,
  listar,
  obtener,
  decidir,
  iniciarConsultaEstatus,
  obtenerEstatusPublico,
}
