import { getDb, mutateDb, newId, nowIso } from './db'

export function registrarBitacora(params: {
  actorId?: string
  actorNombre: string
  accion: string
  detalle: string
  entidad?: string
  entidadId?: string
}) {
  mutateDb((db) => {
    db.bitacora.unshift({
      id: newId('bit'),
      fecha: nowIso(),
      ...params,
    })
    // Conserva la bitácora acotada en el demo.
    if (db.bitacora.length > 500) db.bitacora.length = 500
  })
}

export function listarBitacora() {
  return [...getDb().bitacora]
}
