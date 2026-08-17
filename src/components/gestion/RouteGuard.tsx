import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { can, type Permission } from '@/lib/permissions'
import type { Role } from '@/lib/types'

// Guards de ruta por rol. Recordatorio importante: esto solo controla lo que
// se MUESTRA en el navegador. Cuando este módulo hable con un backend real,
// cada endpoint de escritura debe volver a validar el rol/permiso del lado
// del servidor — nunca confiar solo en esta capa de UI.

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useSession()
  if (!user) return <Navigate to="/" replace />
  if (!roles.includes(user.rol)) return <Navigate to="/resumen" replace />
  return <>{children}</>
}

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { user } = useSession()
  if (!user) return <Navigate to="/" replace />
  if (!can(user.rol, permission)) return <Navigate to="/resumen" replace />
  return <>{children}</>
}
