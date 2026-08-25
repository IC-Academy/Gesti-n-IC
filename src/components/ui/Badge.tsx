import type { ReactNode } from 'react'
import { classNames } from '../../lib/format'
import type {
  EstatusActividad,
  EstatusProyecto,
  EstatusSolicitud,
  Prioridad,
} from '../../types'
import {
  ESTATUS_ACTIVIDAD_LABEL,
  ESTATUS_PROYECTO_LABEL,
  ESTATUS_SOLICITUD_LABEL,
  PRIORIDAD_LABEL,
} from '../../types'

type Tono = 'neutro' | 'azul' | 'amarillo' | 'verde' | 'rojo' | 'gris'

const TONOS: Record<Tono, string> = {
  neutro: 'bg-slate-100 text-slate-700 ring-slate-200',
  azul: 'bg-ic-blue-50 text-ic-blue-800 ring-ic-blue-100',
  amarillo: 'bg-ic-yellow-50 text-ic-yellow-600 ring-ic-yellow-100',
  verde: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rojo: 'bg-red-50 text-red-700 ring-red-100',
  gris: 'bg-gray-100 text-gray-500 ring-gray-200',
}

export function Badge({ tono = 'neutro', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        TONOS[tono],
      )}
    >
      {children}
    </span>
  )
}

const TONO_SOLICITUD: Record<EstatusSolicitud, Tono> = {
  BORRADOR: 'gris',
  PENDIENTE_OTP: 'gris',
  RECIBIDA: 'azul',
  EN_REVISION: 'amarillo',
  AUTORIZADA: 'verde',
  RECHAZADA: 'rojo',
  CANCELADA: 'gris',
  CONVERTIDA_PROYECTO: 'verde',
}

export function EstatusSolicitudBadge({ estatus }: { estatus: EstatusSolicitud }) {
  return <Badge tono={TONO_SOLICITUD[estatus]}>{ESTATUS_SOLICITUD_LABEL[estatus]}</Badge>
}

const TONO_PROYECTO: Record<EstatusProyecto, Tono> = {
  PLANEACION: 'azul',
  EN_PROCESO: 'amarillo',
  PAUSADO: 'gris',
  BLOQUEADO: 'rojo',
  COMPLETADO: 'verde',
  CANCELADO: 'gris',
}

export function EstatusProyectoBadge({ estatus }: { estatus: EstatusProyecto }) {
  return <Badge tono={TONO_PROYECTO[estatus]}>{ESTATUS_PROYECTO_LABEL[estatus]}</Badge>
}

const TONO_ACTIVIDAD: Record<EstatusActividad, Tono> = {
  PENDIENTE: 'gris',
  EN_PROCESO: 'amarillo',
  BLOQUEADA: 'rojo',
  EN_VALIDACION: 'azul',
  COMPLETADA: 'verde',
  CANCELADA: 'gris',
}

export function EstatusActividadBadge({ estatus }: { estatus: EstatusActividad }) {
  return <Badge tono={TONO_ACTIVIDAD[estatus]}>{ESTATUS_ACTIVIDAD_LABEL[estatus]}</Badge>
}

const TONO_PRIORIDAD: Record<Prioridad, Tono> = {
  BAJA: 'gris',
  MEDIA: 'azul',
  ALTA: 'amarillo',
  CRITICA: 'rojo',
}

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  return <Badge tono={TONO_PRIORIDAD[prioridad]}>{PRIORIDAD_LABEL[prioridad]}</Badge>
}
