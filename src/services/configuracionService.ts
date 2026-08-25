import type { Configuracion, Rol, ServiceResult } from '../types'
import { can } from '../lib/permissions'
import { IS_DEMO } from './config'
import { delay, getDb, mutateDb } from './demo/db'
import { http } from './http'

async function listar(rol: Rol | undefined): Promise<ServiceResult<Configuracion[]>> {
  if (!can(rol, 'configuracion.administrar')) {
    return { ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para ver la configuración.' } }
  }
  if (IS_DEMO) return delay({ ok: true, data: [...getDb().configuracion] })
  return http.get<Configuracion[]>('/configuracion')
}

async function actualizar(clave: string, valor: string, rol: Rol | undefined): Promise<ServiceResult<Configuracion>> {
  if (!can(rol, 'configuracion.administrar')) {
    return { ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para modificar la configuración.' } }
  }
  if (IS_DEMO) {
    const actualizado = mutateDb((db) => {
      const item = db.configuracion.find((c) => c.clave === clave)
      if (item) item.valor = valor
      return item ?? { clave, valor }
    })
    return delay({ ok: true, data: actualizado })
  }
  return http.patch<Configuracion>(`/configuracion/${clave}`, { valor })
}

export const configuracionService = { listar, actualizar }
