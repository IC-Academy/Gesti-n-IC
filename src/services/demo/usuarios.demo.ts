import type { Rol, ServiceResult, Usuario } from '../../types'
import { can } from '../../lib/permissions'
import { delay, getDb, mutateDb, newId, nowIso } from './db'
import { registrarBitacora } from './bitacora'

async function listar(rol: Rol | undefined): Promise<ServiceResult<Usuario[]>> {
  if (!can(rol, 'usuarios.gestionar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para consultar usuarios.' } })
  }
  const db = getDb()
  return delay({ ok: true, data: [...db.usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre)) })
}

/**
 * Listado reducido de personal activo, disponible para quienes autorizan
 * solicitudes o asignan actividades (líder, jefe de mantenimiento, admin),
 * sin exponer la gestión completa de cuentas.
 */
async function listarSeleccionables(rol: Rol | undefined): Promise<ServiceResult<Usuario[]>> {
  if (rol !== 'ADMIN' && rol !== 'LIDER' && rol !== 'JEFE_MANTENIMIENTO') {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para consultar personal.' } })
  }
  const db = getDb()
  return delay({ ok: true, data: db.usuarios.filter((u) => u.activo).sort((a, b) => a.nombre.localeCompare(b.nombre)) })
}

export interface NuevoUsuarioInput {
  usuario: string
  nombre: string
  rol: Rol
  correo?: string
  telefono?: string
  area?: string
}

async function crear(input: NuevoUsuarioInput, rolActor: Rol | undefined, actorNombre: string): Promise<ServiceResult<Usuario>> {
  if (!can(rolActor, 'usuarios.gestionar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para crear usuarios.' } })
  }
  const db = getDb()
  if (db.usuarios.some((u) => u.usuario === input.usuario.trim())) {
    return delay({ ok: false, error: { code: 'USUARIO_DUPLICADO', message: 'Ya existe un usuario con esa clave.' } })
  }

  const nuevo = mutateDb((db) => {
    const u: Usuario = {
      id: newId('usr'),
      usuario: input.usuario.trim(),
      nombre: input.nombre.trim(),
      rol: input.rol,
      correo: input.correo?.trim(),
      telefono: input.telefono?.trim(),
      area: input.area?.trim(),
      activo: true,
      creadoEn: nowIso(),
      actualizadoEn: nowIso(),
    }
    db.usuarios.push(u)
    return u
  })

  registrarBitacora({
    actorNombre,
    accion: 'USUARIO_CREADO',
    detalle: `Se creó el usuario ${nuevo.usuario} — ${nuevo.nombre} (${nuevo.rol}).`,
    entidad: 'usuario',
    entidadId: nuevo.id,
  })

  return delay({ ok: true, data: nuevo })
}

export interface ActualizarUsuarioInput {
  nombre?: string
  rol?: Rol
  correo?: string
  telefono?: string
  area?: string
  activo?: boolean
}

async function actualizar(
  id: string,
  patch: ActualizarUsuarioInput,
  rolActor: Rol | undefined,
  actorNombre: string,
): Promise<ServiceResult<Usuario>> {
  if (!can(rolActor, 'usuarios.gestionar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para modificar usuarios.' } })
  }
  if (patch.rol !== undefined && !can(rolActor, 'usuarios.cambiar_rol')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para cambiar roles.' } })
  }
  if (patch.activo !== undefined && !can(rolActor, 'usuarios.activar_desactivar')) {
    return delay({ ok: false, error: { code: 'SIN_PERMISO', message: 'No tienes permiso para activar o desactivar usuarios.' } })
  }

  const db = getDb()
  if (!db.usuarios.some((u) => u.id === id)) {
    return delay({ ok: false, error: { code: 'NO_ENCONTRADO', message: 'Usuario no encontrado.' } })
  }

  const actualizado = mutateDb((db) => {
    const u = db.usuarios.find((u) => u.id === id)!
    Object.assign(u, patch, { actualizadoEn: nowIso() })
    return { ...u }
  })

  registrarBitacora({
    actorNombre,
    accion: 'USUARIO_ACTUALIZADO',
    detalle: `Se actualizó el usuario ${actualizado.usuario}${patch.activo !== undefined ? (patch.activo ? ' (activado)' : ' (desactivado)') : ''}${patch.rol ? ` — nuevo rol: ${patch.rol}` : ''}.`,
    entidad: 'usuario',
    entidadId: actualizado.id,
  })

  return delay({ ok: true, data: actualizado })
}

export const usuariosDemo = { listar, listarSeleccionables, crear, actualizar }
