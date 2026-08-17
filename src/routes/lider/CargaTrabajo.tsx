import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { cargaDeTrabajoPorArea } from '@/lib/demoSelectors'
import { ProgressBar } from '@/components/gestion/ProgressBar'
import { EmptyState } from '@/components/States'

export function CargaTrabajo() {
  const state = useDemoStore()
  const { user } = useSession()
  const nav = useNavigate()
  const [areaId, setAreaId] = useState(user?.areaId ?? '')
  if (!user) return null

  const areaSeleccionada = user.rol === 'admin' ? areaId || user.areaId : user.areaId
  const carga = cargaDeTrabajoPorArea(state, areaSeleccionada)

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="gestion-kicker">CAPACIDAD Y ASIGNACIÓN</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Carga de trabajo</h1>
          <p className="text-sm text-slate-500">Balance de proyectos activos y avance por integrante.</p>
        </div>
        {user.rol === 'admin' ? (
          <select value={areaSeleccionada} onChange={(e) => setAreaId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-xs">
            {state.areas.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        ) : null}
      </div>

      {carga.length === 0 ? (
        <EmptyState label="No hay integrantes activos en esta área." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {carga.map(({ usuario, proyectosActivos, avancePromedio, bloqueados }) => (
            <article key={usuario.id} className="gestion-panel p-5">
              <div className="flex items-center gap-3">
                <span className="avatar-big">{usuario.avatarIniciales}</span>
                <div className="flex-1">
                  <b>{usuario.nombre}</b>
                  <small className="block text-xs text-slate-500">{usuario.puesto}</small>
                </div>
                <em className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">{proyectosActivos} activo(s)</em>
              </div>
              <div className="mt-4"><ProgressBar avance={avancePromedio} /></div>
              <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs">
                <span><b>{avancePromedio}%</b> avance promedio</span>
                <span className={bloqueados ? 'font-semibold text-rose-600' : 'text-slate-500'}>{bloqueados} bloqueado(s)</span>
                <button onClick={() => nav('/proyectos')} className="font-semibold text-blue-700">Ver proyectos →</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
