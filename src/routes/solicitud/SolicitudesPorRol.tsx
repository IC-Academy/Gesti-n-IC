import { useSession } from '@/lib/session'
import { RequestsListPage } from './RequestsListPage'

export function SolicitudesPorRol() {
  const { user } = useSession()
  if (!user) return null
  if (user.rol === 'admin') return <RequestsListPage scope="all" title="Todas las solicitudes" subtitle="Necesidades de mantenimiento reportadas en todos los inmuebles." />
  return <RequestsListPage scope="area" title="Bandeja de mantenimiento" subtitle="Solicitudes que requieren diagnóstico, priorización o asignación." soloAbiertas />
}
