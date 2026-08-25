import type { BitacoraEvento, Rol, ServiceResult } from '../types'
import { can } from '../lib/permissions'
import { IS_DEMO } from './config'
import { delay } from './demo/db'
import { listarBitacora } from './demo/bitacora'
import { http } from './http'

async function obtener(rol: Rol | undefined): Promise<ServiceResult<BitacoraEvento[]>> {
  if (!can(rol, 'bitacora.ver')) {
    return { ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para consultar la bitácora.' } }
  }
  if (IS_DEMO) return delay({ ok: true, data: listarBitacora() })
  return http.get<BitacoraEvento[]>('/bitacora')
}

export const bitacoraService = { obtener }
