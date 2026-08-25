import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homeRouteForRole } from '../../lib/permissions'

export function AppIndexRedirect() {
  const { rolEfectivo } = useAuth()
  if (!rolEfectivo) return null
  return <Navigate to={homeRouteForRole(rolEfectivo)} replace />
}
