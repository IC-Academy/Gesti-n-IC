import { useSession } from '@/lib/session'
import { RequestsListPage } from './RequestsListPage'

export function SolicitudesPorRol() {
  const { user } = useSession()
  if (!user) return null
  if (user.rol === 'admin') return <RequestsListPage scope="all" title="Todas las solicitudes" subtitle="Solicitudes de proyecto de todas las áreas." />
  return <RequestsListPage scope="area" title="Solicitudes del área" subtitle="Solicitudes que requieren revisión, dictamen o asignación en tu área." soloAbiertas />
}
