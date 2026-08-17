import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/lib/session'

/** Encabezado mínimo para las pantallas públicas del portal del solicitante (sin sesión iniciada). */
export function PortalShell({ children }: { children: ReactNode }) {
  const { user } = useSession()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="gestion-logo">IC</span>
          <span className="text-sm font-semibold text-slate-800">Gestión IC · Portal de solicitudes</span>
        </Link>
        <Link to={user ? '/resumen' : '/'} className="text-xs font-semibold text-blue-700 hover:underline">
          {user ? 'Ir a mi panel →' : 'Iniciar sesión →'}
        </Link>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
