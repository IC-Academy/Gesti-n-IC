import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Accion } from '../lib/permissions'
import { can } from '../lib/permissions'
import { LoadingState } from '../components/ui/Feedback'

/** Exige una sesión activa; de lo contrario redirige a /login conservando el destino. */
export function RequireAuth() {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return <LoadingState label="Verificando tu sesión…" />
  if (!usuario) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

/**
 * Exige que el rol EFECTIVO (considerando la simulación de rol del admin)
 * tenga alguno de los permisos indicados. La verificación real de cada
 * acción vuelve a ejecutarse en la capa de servicios: este guard solo evita
 * que la interfaz se muestre a quien no debería verla.
 */
export function RequirePermission({ anyOf }: { anyOf: Accion[] }) {
  const { rolEfectivo } = useAuth()
  const permitido = anyOf.some((accion) => can(rolEfectivo, accion))
  if (!permitido) return <Navigate to="/app/no-autorizado" replace />
  return <Outlet />
}
