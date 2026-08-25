import { useEffect, useState } from 'react'
import {
  Inbox,
  ClipboardCheck,
  ThumbsDown,
  FolderKanban,
  Lock,
  AlarmClockOff,
  Gauge,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { dashboardService, type DashboardData } from '../../services/dashboardService'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { TendenciaSolicitudesChart, DistribucionPrioridadChart, CargaResponsableChart } from '../../components/charts/DashboardCharts'
import { EstatusProyectoBadge, PrioridadBadge } from '../../components/ui/Badge'
import { formatFecha } from '../../lib/format'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { rolEfectivo } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    dashboardService.obtener(rolEfectivo ?? undefined).then((res) => {
      if (!activo) return
      if (res.ok) setData(res.data)
      else setError(res.error.message)
      setCargando(false)
    })
    return () => {
      activo = false
    }
  }, [rolEfectivo])

  if (cargando) return <LoadingState label="Cargando dashboard ejecutivo…" />
  if (error || !data) return <ErrorState description={error ?? undefined} />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Dashboard ejecutivo</h1>
        <p className="mt-1 text-sm text-ic-slate">Panorama general de solicitudes, proyectos y equipo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Solicitudes recibidas" value={data.solicitudesRecibidas} icon={Inbox} tono="azul" />
        <StatCard label="Pendientes de revisión" value={data.solicitudesPendientesRevision} icon={Gauge} tono="amarillo" />
        <StatCard label="Autorizadas" value={data.solicitudesAutorizadas} icon={ClipboardCheck} tono="verde" />
        <StatCard label="Rechazadas" value={data.solicitudesRechazadas} icon={ThumbsDown} tono="rojo" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Proyectos activos" value={data.proyectosActivos} icon={FolderKanban} tono="azul" />
        <StatCard label="Proyectos bloqueados" value={data.proyectosBloqueados} icon={Lock} tono="rojo" />
        <StatCard label="Proyectos vencidos" value={data.proyectosVencidos} icon={AlarmClockOff} tono="amarillo" />
        <StatCard label="Avance promedio" value={`${data.avancePromedio}%`} icon={TrendingUp} tono="verde" hint={`Cumplimiento general: ${data.cumplimientoGeneral}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tendencia mensual de solicitudes" description="Últimos 6 meses" />
          <CardBody>
            <TendenciaSolicitudesChart data={data.tendenciaMensual} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Distribución por prioridad" description="Proyectos activos y cerrados" />
          <CardBody>
            <DistribucionPrioridadChart data={data.distribucionPrioridad} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Carga de actividades por responsable" />
        <CardBody>
          <CargaResponsableChart data={data.cargaPorResponsable} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Proyectos que requieren atención" description="Bloqueados, vencidos o con avance por debajo de lo esperado" />
        <CardBody className="p-0">
          {data.proyectosAtencion.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-ic-slate">No hay proyectos que requieran atención inmediata.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ic-line text-xs uppercase tracking-wide text-ic-slate">
                  <tr>
                    <th className="px-6 py-3 font-medium">Proyecto</th>
                    <th className="px-6 py-3 font-medium">Prioridad</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                    <th className="px-6 py-3 font-medium">Fin planeado</th>
                    <th className="px-6 py-3 font-medium">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.proyectosAtencion.map(({ proyecto, motivo }) => (
                    <tr key={proyecto.id} className="border-b border-ic-line last:border-b-0 hover:bg-ic-blue-50/40">
                      <td className="px-6 py-3">
                        <Link to={`/app/proyectos/${proyecto.id}`} className="font-medium text-ic-blue-800 hover:underline">
                          {proyecto.folio} — {proyecto.nombre}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <PrioridadBadge prioridad={proyecto.prioridad} />
                      </td>
                      <td className="px-6 py-3">
                        <EstatusProyectoBadge estatus={proyecto.estatus} />
                      </td>
                      <td className="px-6 py-3 text-ic-slate">{formatFecha(proyecto.fechaFinPlaneada)}</td>
                      <td className="px-6 py-3 text-ic-slate">{motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
