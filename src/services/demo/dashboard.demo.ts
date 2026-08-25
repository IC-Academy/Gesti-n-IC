import type { Prioridad, Proyecto, ServiceResult } from '../../types'
import { can } from '../../lib/permissions'
import type { Rol } from '../../types'
import { delay, getDb } from './db'

export interface CargaResponsable {
  usuarioId: string
  nombre: string
  actividadesActivas: number
  actividadesCompletadas: number
}

export interface TendenciaMensual {
  mes: string
  solicitudes: number
}

export interface ProyectoAtencion {
  proyecto: Proyecto
  motivo: string
}

export interface DashboardData {
  solicitudesRecibidas: number
  solicitudesPendientesRevision: number
  solicitudesAutorizadas: number
  solicitudesRechazadas: number
  proyectosActivos: number
  proyectosBloqueados: number
  proyectosVencidos: number
  cumplimientoGeneral: number
  avancePromedio: number
  cargaPorResponsable: CargaResponsable[]
  distribucionPrioridad: Record<Prioridad, number>
  tendenciaMensual: TendenciaMensual[]
  proyectosAtencion: ProyectoAtencion[]
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

async function obtener(rol: Rol | undefined): Promise<ServiceResult<DashboardData>> {
  if (!can(rol, 'dashboard.ver')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para ver el dashboard.' } })
  }

  const db = getDb()
  const hoy = new Date()

  const solicitudesRecibidas = db.solicitudes.filter((s) => s.estatus !== 'BORRADOR' && s.estatus !== 'PENDIENTE_OTP').length
  const solicitudesPendientesRevision = db.solicitudes.filter((s) => s.estatus === 'RECIBIDA' || s.estatus === 'EN_REVISION').length
  const solicitudesAutorizadas = db.solicitudes.filter((s) => s.estatus === 'AUTORIZADA' || s.estatus === 'CONVERTIDA_PROYECTO').length
  const solicitudesRechazadas = db.solicitudes.filter((s) => s.estatus === 'RECHAZADA').length

  const proyectosActivos = db.proyectos.filter((p) => p.estatus === 'EN_PROCESO' || p.estatus === 'PLANEACION').length
  const proyectosBloqueados = db.proyectos.filter((p) => p.estatus === 'BLOQUEADO').length
  const proyectosVencidos = db.proyectos.filter(
    (p) => p.estatus !== 'COMPLETADO' && p.estatus !== 'CANCELADO' && new Date(p.fechaFinPlaneada) < hoy,
  ).length

  const proyectosCerrables = db.proyectos.filter((p) => p.estatus === 'COMPLETADO' || p.estatus === 'CANCELADO')
  const cumplimientoGeneral = proyectosCerrables.length
    ? Math.round((db.proyectos.filter((p) => p.estatus === 'COMPLETADO').length / proyectosCerrables.length) * 100)
    : 0

  const avancePromedio = db.proyectos.length
    ? Math.round(db.proyectos.reduce((acc, p) => acc + p.avance, 0) / db.proyectos.length)
    : 0

  const responsablesMap = new Map<string, CargaResponsable>()
  for (const a of db.actividades) {
    if (!a.responsableId) continue
    const usuario = db.usuarios.find((u) => u.id === a.responsableId)
    if (!usuario) continue
    if (!responsablesMap.has(usuario.id)) {
      responsablesMap.set(usuario.id, { usuarioId: usuario.id, nombre: usuario.nombre, actividadesActivas: 0, actividadesCompletadas: 0 })
    }
    const registro = responsablesMap.get(usuario.id)!
    if (a.estatus === 'COMPLETADA') registro.actividadesCompletadas += 1
    else if (a.estatus !== 'CANCELADA') registro.actividadesActivas += 1
  }

  const distribucionPrioridad: Record<Prioridad, number> = { BAJA: 0, MEDIA: 0, ALTA: 0, CRITICA: 0 }
  for (const p of db.proyectos) distribucionPrioridad[p.prioridad] += 1

  const tendenciaMensual: TendenciaMensual[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const count = db.solicitudes.filter((s) => {
      const sd = new Date(s.creadoEn)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    }).length
    tendenciaMensual.push({ mes: MESES[d.getMonth()], solicitudes: count })
  }

  const proyectosAtencion: ProyectoAtencion[] = []
  for (const p of db.proyectos) {
    if (p.estatus === 'BLOQUEADO') proyectosAtencion.push({ proyecto: p, motivo: 'Proyecto bloqueado' })
    else if (p.estatus !== 'COMPLETADO' && p.estatus !== 'CANCELADO' && new Date(p.fechaFinPlaneada) < hoy) {
      proyectosAtencion.push({ proyecto: p, motivo: 'Fecha planeada vencida' })
    } else if (p.estatus === 'EN_PROCESO' && p.avance < 20 && new Date(p.fechaInicio) < hoy) {
      proyectosAtencion.push({ proyecto: p, motivo: 'Avance por debajo de lo esperado' })
    }
  }

  const data: DashboardData = {
    solicitudesRecibidas,
    solicitudesPendientesRevision,
    solicitudesAutorizadas,
    solicitudesRechazadas,
    proyectosActivos,
    proyectosBloqueados,
    proyectosVencidos,
    cumplimientoGeneral,
    avancePromedio,
    cargaPorResponsable: [...responsablesMap.values()],
    distribucionPrioridad,
    tendenciaMensual,
    proyectosAtencion,
  }

  return delay({ ok: true, data })
}

export const dashboardDemo = { obtener }
