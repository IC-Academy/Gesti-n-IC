import { v4 as uuid } from 'uuid'
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
} from '../../types'
import {
  ACTIVIDADES_SEED,
  BITACORA_SEED,
  COMENTARIOS_SEED,
  CONFIGURACION_SEED,
  EVIDENCIAS_SEED,
  OTP_SEED,
  PROYECTOS_SEED,
  SOLICITUDES_SEED,
  USUARIOS_SEED,
} from '../../data/seed'

// ============================================================================
// Repositorio local persistido en localStorage. Simula el almacenamiento que,
// en producción, viviría detrás de los webhooks de n8n / Airtable. Ningún
// componente de UI accede a localStorage directamente: todo pasa por los
// *.demo.ts de src/services/demo.
// ============================================================================

const STORAGE_KEY = 'gestion-ic:db:v1'

export interface DemoDb {
  usuarios: Usuario[]
  solicitudes: Solicitud[]
  proyectos: Proyecto[]
  actividades: Actividad[]
  evidencias: Evidencia[]
  comentarios: Comentario[]
  otp: OtpRegistro[]
  bitacora: BitacoraEvento[]
  configuracion: Configuracion[]
}

function seedDb(): DemoDb {
  return {
    usuarios: structuredClone(USUARIOS_SEED),
    solicitudes: structuredClone(SOLICITUDES_SEED),
    proyectos: structuredClone(PROYECTOS_SEED),
    actividades: structuredClone(ACTIVIDADES_SEED),
    evidencias: structuredClone(EVIDENCIAS_SEED),
    comentarios: structuredClone(COMENTARIOS_SEED),
    otp: structuredClone(OTP_SEED),
    bitacora: structuredClone(BITACORA_SEED),
    configuracion: structuredClone(CONFIGURACION_SEED),
  }
}

let cache: DemoDb | null = null

function loadFromStorage(): DemoDb {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedDb()
    const parsed = JSON.parse(raw) as Partial<DemoDb>
    const base = seedDb()
    return {
      usuarios: parsed.usuarios ?? base.usuarios,
      solicitudes: parsed.solicitudes ?? base.solicitudes,
      proyectos: parsed.proyectos ?? base.proyectos,
      actividades: parsed.actividades ?? base.actividades,
      evidencias: parsed.evidencias ?? base.evidencias,
      comentarios: parsed.comentarios ?? base.comentarios,
      otp: parsed.otp ?? base.otp,
      bitacora: parsed.bitacora ?? base.bitacora,
      configuracion: parsed.configuracion ?? base.configuracion,
    }
  } catch {
    return seedDb()
  }
}

function persist(db: DemoDb) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
import { v4 as uuid } from 'uuid'
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
} from '../../types'
import {
  ACTIVIDADES_SEED,
  BITACORA_SEED,
  COMENTARIOS_SEED,
  CONFIGURACION_SEED,
  EVIDENCIAS_SEED,
  OTP_SEED,
  PROYECTOS_SEED,
  SOLICITUDES_SEED,
  USUARIOS_SEED,
} from '../../data/seed'

// ============================================================================
// Repositorio local persistido en localStorage. Simula el almacenamiento que,
// en producción, viviría detrás de los webhooks de n8n / Airtable. Ningún
// componente de UI accede a localStorage directamente: todo pasa por los
// *.demo.ts de src/services/demo.
// ============================================================================

const STORAGE_KEY = 'gestion-ic:db:v1'

export interface DemoDb {
  usuarios: Usuario[]
  solicitudes: Solicitud[]
  proyectos: Proyecto[]
  actividades: Actividad[]
  evidencias: Evidencia[]
  comentarios: Comentario[]
  otp: OtpRegistro[]
  bitacora: BitacoraEvento[]
  configuracion: Configuracion[]
}

function seedDb(): DemoDb {
  return {
    usuarios: structuredClone(USUARIOS_SEED),
    solicitudes: structuredClone(SOLICITUDES_SEED),
    proyectos: structuredClone(PROYECTOS_SEED),
    actividades: structuredClone(ACTIVIDADES_SEED),
    evidencias: structuredClone(EVIDENCIAS_SEED),
    comentarios: structuredClone(COMENTARIOS_SEED),
    otp: structuredClone(OTP_SEED),
    bitacora: structuredClone(BITACORA_SEED),
    configuracion: structuredClone(CONFIGURACION_SEED),
  }
}

let cache: DemoDb | null = null

function loadFromStorage(): DemoDb {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedDb()
    const parsed = JSON.parse(raw) as Partial<DemoDb>
    const base = seedDb()
    return {
      usuarios: parsed.usuarios ?? base.usuarios,
      solicitudes: parsed.solicitudes ?? base.solicitudes,
      proyectos: parsed.proyectos ?? base.proyectos,
      actividades: parsed.actividades ?? base.actividades,
      evidencias: parsed.evidencias ?? base.evidencias,
      comentarios: parsed.comentarios ?? base.comentarios,
      otp: parsed.otp ?? base.otp,
      bitacora: parsed.bitacora ?? base.bitacora,
      configuracion: parsed.configuracion ?? base.configuracion,
    }
  } catch {
    return seedDb()
  }
}

function persist(db: DemoDb) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Almacenamiento no disponible (modo privado, cuota excedida, etc.)
    // El demo continúa operando solo en memoria durante la sesión.
  }
}

export function getDb(): DemoDb {
  if (!cache) cache = loadFromStorage()
  return cache
}

/** Aplica una mutación sobre la base y persiste el resultado. */
export function mutateDb<T>(fn: (db: DemoDb) => T): T {
  const db = getDb()
  const result = fn(db)
  persist(db)
  return result
}

export function resetDb(): void {
  cache = seedDb()
  folioSolicitudCounter = null
  folioProyectoCounter = null
  folioActividadCounter = null
  persist(cache)
}

export function newId(prefix: string): string {
  return `${prefix}-${uuid().slice(0, 8)}`
}

/** Simula latencia de red para que la UI ejercite sus estados de carga. */
export function delay<T>(value: T, ms = 420): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let folioSolicitudCounter: number | null = null
let folioProyectoCounter: number | null = null
let folioActividadCounter: number | null = null

function nextFolio(
  kind: 'SOL' | 'PRY' | 'ACT',
  existing: string[],
  cachedCounter: number | null,
  setCounter: (n: number) => void,
): string {
  if (cachedCounter === null) {
    const nums = existing
      .map((f) => Number(f.split('-').pop()))
      .filter((n) => !Number.isNaN(n))
    cachedCounter = nums.length ? Math.max(...nums) : 0
  }
  cachedCounter += 1
  setCounter(cachedCounter)
  const year = new Date().getFullYear()
  if (kind === 'ACT') return `ACT-${String(cachedCounter).padStart(4, '0')}`
  return `${kind}-${year}-${String(cachedCounter).padStart(4, '0')}`
}

export function nextFolioSolicitud(db: DemoDb): string {
  return nextFolio(
    'SOL',
    db.solicitudes.map((s) => s.folio),
    folioSolicitudCounter,
    (n) => (folioSolicitudCounter = n),
  )
}

export function nextFolioProyecto(db: DemoDb): string {
  return nextFolio(
    'PRY',
    db.proyectos.map((p) => p.folio),
    folioProyectoCounter,
    (n) => (folioProyectoCounter = n),
  )
}

export function nextFolioActividad(db: DemoDb): string {
  return nextFolio(
    'ACT',
    db.actividades.map((a) => a.folio),
    folioActividadCounter,
    (n) => (folioActividadCounter = n),
  )
}

export function nowIso(): string {
  return new Date().toISOString()
}
  } catch {
    // Almacenamiento no disponible (modo privado, cuota excedida, etc.)
    // El demo continúa operando solo en memoria durante la sesión.
  }
}

export function getDb(): DemoDb {
  if (!cache) cache = loadFromStorage()
  return cache
}

/** Aplica una mutación sobre la base y persiste el resultado. */
export function mutateDb<T>(fn: (db: DemoDb) => T): T {
  const db = getDb()
  const result = fn(db)
  persist(db)
  return result
}

export function resetDb(): void {
  cache = seedDb()
  persist(cache)
}

export function newId(prefix: string): string {
  return `${prefix}-${uuid().slice(0, 8)}`
}

/** Simula latencia de red para que la UI ejercite sus estados de carga. */
export function delay<T>(value: T, ms = 420): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let folioSolicitudCounter: number | null = null
let folioProyectoCounter: number | null = null
let folioActividadCounter: number | null = null

function nextFolio(
  kind: 'SOL' | 'PRY' | 'ACT',
  existing: string[],
  cachedCounter: number | null,
  setCounter: (n: number) => void,
): string {
  if (cachedCounter === null) {
    const nums = existing
      .map((f) => Number(f.split('-').pop()))
      .filter((n) => !Number.isNaN(n))
    cachedCounter = nums.length ? Math.max(...nums) : 0
  }
  cachedCounter += 1
  setCounter(cachedCounter)
  const year = new Date().getFullYear()
  if (kind === 'ACT') return `ACT-${String(cachedCounter).padStart(4, '0')}`
  return `${kind}-${year}-${String(cachedCounter).padStart(4, '0')}`
}

export function nextFolioSolicitud(db: DemoDb): string {
  return nextFolio(
    'SOL',
    db.solicitudes.map((s) => s.folio),
    folioSolicitudCounter,
    (n) => (folioSolicitudCounter = n),
  )
}

export function nextFolioProyecto(db: DemoDb): string {
  return nextFolio(
    'PRY',
    db.proyectos.map((p) => p.folio),
    folioProyectoCounter,
    (n) => (folioProyectoCounter = n),
  )
}

export function nextFolioActividad(db: DemoDb): string {
  return nextFolio(
    'ACT',
    db.actividades.map((a) => a.folio),
    folioActividadCounter,
    (n) => (folioActividadCounter = n),
  )
}

export function nowIso(): string {
  return new Date().toISOString()
}
