import { useState } from 'react'
import { useDemoStore } from '@/lib/demoStore'
import { usuarioPorId } from '@/lib/demoSelectors'
import { EmptyState } from '@/components/States'

export function Auditoria() {
  const state = useDemoStore()
  const [busqueda, setBusqueda] = useState('')

  const entradas = [...state.audit]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .filter((e) => {
      if (!busqueda) return true
      const autor = usuarioPorId(state, e.usuarioId)?.nombre ?? e.usuarioId
      return `${e.accion} ${e.entidad} ${autor} ${e.detalle ?? ''}`.toLowerCase().includes(busqueda.toLowerCase())
    })

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">GOBIERNO DEL PORTAL</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Auditoría</h1>
        <p className="text-sm text-slate-500">Bitácora de acciones administrativas y de gestión realizadas en el sistema.</p>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por acción, entidad o usuario…"
        className="mb-4 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <section className="gestion-panel">
        {entradas.length === 0 ? (
          <EmptyState label="No hay entradas de auditoría que coincidan." />
        ) : (
          <ol className="divide-y divide-slate-100">
            {entradas.map((e) => {
              const autor = usuarioPorId(state, e.usuarioId)
              return (
                <li key={e.id} className="flex items-start gap-3 px-5 py-3 text-xs">
                  <span className="avatar-mini shrink-0">{autor?.avatarIniciales ?? '—'}</span>
                  <div>
                    <p className="text-slate-700">
                      <b>{autor?.nombre ?? e.usuarioId}</b> · {e.accion} <span className="text-slate-400">({e.entidad})</span>
                    </p>
                    {e.detalle ? <p className="text-slate-500">{e.detalle}</p> : null}
                    <p className="text-[10px] text-slate-400">{new Date(e.fecha).toLocaleString('es-MX')}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
