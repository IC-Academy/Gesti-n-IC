import type { ServiceResult, SesionUsuario } from '../../types'
import { delay, getDb, newId, nowIso } from './db'
import { registrarBitacora } from './bitacora'

const PASSWORD_DEMO = '123456'

async function login(usuario: string, password: string): Promise<ServiceResult<SesionUsuario>> {
  const db = getDb()
  const cuenta = db.usuarios.find((u) => u.usuario === usuario.trim())

  if (!cuenta) {
    return delay({ ok: false, error: { code: 'USUARIO_NO_ENCONTRADO', message: 'Usuario o contraseña incorrectos.' } })
  }
  if (!cuenta.activo) {
    return delay({ ok: false, error: { code: 'USUARIO_INACTIVO', message: 'Esta cuenta se encuentra desactivada.' } })
  }
  if (password !== PASSWORD_DEMO) {
    return delay({ ok: false, error: { code: 'CREDENCIALES_INVALIDAS', message: 'Usuario o contraseña incorrectos.' } })
  }

  registrarBitacora({
    actorId: cuenta.id,
    actorNombre: cuenta.nombre,
    accion: 'INICIO_SESION',
    detalle: `${cuenta.nombre} (${cuenta.usuario}) inició sesión.`,
    entidad: 'usuario',
    entidadId: cuenta.id,
  })

  const sesion: SesionUsuario = {
    usuario: cuenta,
    token: newId('demo-token'),
    emitidoEn: nowIso(),
  }
  return delay({ ok: true, data: sesion })
}

export const authDemo = { login }
