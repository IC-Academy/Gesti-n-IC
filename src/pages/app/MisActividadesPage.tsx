import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { actividadesService } from '../../services/actividadesService'
import { proyectosService } from '../../services/proyectosService'
import type { Actividad, Proyecto } from '../../types'
import { EstatusActividadBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Feedback'
import { formatFecha } from '../../lib/format'

export function MisActividadesPage() {
  const { usuario, rolEfectivo } = useAuth()
  const [actividades, setActividades] = useState<Actividad[] | null>(null)
  const [proyectos, setProyectos] = useState<Record<string, Proyecto>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) return
    let activo = true
    actividadesService.listarAsignadas(usuario.id).then(async (res) => {
      if (!activo) return
      if (!res.ok) {
        setError(res.error.message)
        return
      }
      setActividades(res.data)
      const idsUnicos = [...new Set(res.data.map((a) => a.proyectoId))]
      const mapa: Record<string, Proyecto> = {}
      await Promise.all(
        idsUnicos.map(async (pid) => {
          const rp = await proyectosService.obtener(pid, rolEfectivo ?? undefined, usuario.id)
          if (rp.ok) mapa[pid] = rp.data
        }),
      )
      if (activo) setProyectos(mapa)
    })
    return () => {
      activo = false
    }
  }, [usuario, rolEfectivo])

  if (error) return <ErrorState description={error} />
  if (!actividades) return <LoadingState label="Cargando tus actividades…" />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Mis actividades</h1>
        <p className="mt-1 text-sm text-ic-slate">Actividades asignadas a ti en los proyectos activos.</p>
      </div>

      {actividades.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-6 w-6" />} title="Sin actividades asignadas" description="Cuando se te asigne una actividad, aparecerá aquí." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {actividades.map((a) => (
            <Link
              key={a.id}
              to={`/app/actividades/${a.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-ic-line bg-white p-5 shadow-ic-sm transition hover:-translate-y-0.5 hover:shadow-ic-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-ic-blue-700">{a.folio}</p>
                <EstatusActividadBadge estatus={a.estatus} />
              </div>
              <h3 className="text-base font-semibold leading-snug text-ic-ink">{a.nombre}</h3>
              <p className="text-xs text-ic-slate">{proyectos[a.proyectoId]?.nombre ?? 'Proyecto'} · {proyectos[a.proyectoId]?.ubicacion}</p>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-ic-slate">Avance</span>
                  <span className="font-semibold text-ic-blue-800">{a.avance}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-ic-blue-700" style={{ width: `${a.avance}%` }} />
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <PrioridadBadge prioridad={a.prioridad} />
                <span className="text-xs text-ic-slate">{formatFecha(a.fechaFin)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
