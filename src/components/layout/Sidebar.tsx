import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  Users,
  ScrollText,
  Settings,
  ListChecks,
} from 'lucide-react'
import { classNames } from '../../lib/format'
import { can } from '../../lib/permissions'
import type { Rol } from '../../types'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  visible: (rol: Rol | null) => boolean
}

const ITEMS: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: (r) => can(r, 'dashboard.ver') },
  { to: '/app/solicitudes', label: 'Solicitudes', icon: Inbox, visible: (r) => can(r, 'solicitudes.ver_todas') },
  {
    to: '/app/proyectos',
    label: 'Proyectos',
    icon: FolderKanban,
    visible: (r) => can(r, 'proyectos.ver_todos') || can(r, 'proyectos.ver_asignados'),
  },
  { to: '/app/mis-actividades', label: 'Mis actividades', icon: ListChecks, visible: (r) => can(r, 'actividades.ver_propias') },
  { to: '/app/usuarios', label: 'Usuarios', icon: Users, visible: (r) => can(r, 'usuarios.gestionar') },
  { to: '/app/bitacora', label: 'Bitácora', icon: ScrollText, visible: (r) => can(r, 'bitacora.ver') },
  { to: '/app/configuracion', label: 'Configuración', icon: Settings, visible: (r) => can(r, 'configuracion.administrar') },
]

export function Sidebar({ rol, onNavigate }: { rol: Rol | null; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {ITEMS.filter((item) => item.visible(rol)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            classNames(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              isActive ? 'bg-ic-yellow-500 text-ic-blue-900' : 'text-white/80 hover:bg-white/10 hover:text-white',
            )
          }
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
