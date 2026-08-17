import { type ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileSearch,
  FolderKanban,
  Gauge,
  Inbox,
  LayoutGrid,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useSession } from '@/lib/session'
import { ROLE_LABELS } from '@/lib/catalog'
import { NotificationBell } from '@/components/gestion/NotificationBell'
import { useDemoStore } from '@/lib/demoStore'
import { areaPorId } from '@/lib/demoSelectors'

interface NavItem {
  to: string
  label: string
  icon: typeof BarChart3
  end?: boolean
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, salir } = useSession()
  const state = useDemoStore()
  const nav = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  if (!user) return null

  const area = areaPorId(state, user.areaId)
  const roleName = ROLE_LABELS[user.rol]

  const general: NavItem[] = [{ to: '/resumen', label: 'Resumen', icon: BarChart3, end: true }]

  const proyectos: NavItem[] = [{ to: '/proyectos', label: user.rol === 'usuario' ? 'Mis proyectos' : user.rol === 'lider' ? 'Proyectos del equipo' : 'Todos los proyectos', icon: FolderKanban }]

  const portal: NavItem[] = [
    { to: '/portal/nueva-solicitud', label: 'Nueva solicitud', icon: ClipboardList },
    { to: '/portal/consultar', label: 'Consultar estatus', icon: FileSearch },
  ]

  const liderazgo: NavItem[] =
    user.rol === 'lider' || user.rol === 'admin'
      ? [
          { to: '/solicitudes', label: user.rol === 'admin' ? 'Todas las solicitudes' : 'Solicitudes del área', icon: Inbox },
          { to: '/asignacion', label: 'Asignación de responsables', icon: ListChecks },
          { to: '/equipo/carga', label: 'Carga de trabajo', icon: Users },
          { to: '/evidencias/validacion', label: 'Validación de evidencias', icon: ShieldCheck },
          { to: '/alertas', label: 'Alertas', icon: AlertTriangle },
        ]
      : []

  const administracion: NavItem[] =
    user.rol === 'admin'
      ? [
          { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
          { to: '/admin/roles', label: 'Roles y permisos', icon: ShieldCheck },
          { to: '/admin/areas', label: 'Áreas y líderes', icon: BriefcaseBusiness },
          { to: '/admin/catalogos', label: 'Catálogos', icon: LayoutGrid },
          { to: '/admin/auditoria', label: 'Auditoría', icon: Gauge },
        ]
      : []

  const bi: NavItem[] = [
    { to: '/bi/registrar', label: 'Solicitud BI (n8n)', icon: ClipboardList },
    { to: '/bi/consultar', label: 'Consultar solicitud BI', icon: FileSearch },
    ...(user.rol !== 'usuario' ? ([{ to: '/bi/bandeja', label: 'Bandeja BI (n8n)', icon: Inbox }, { to: '/bi/autorizaciones', label: 'Autorizaciones BI (n8n)', icon: ShieldCheck }] as NavItem[]) : []),
  ]

  function renderGroup(title: string, items: NavItem[]) {
    if (!items.length) return null
    return (
      <div>
        <p className="px-5 pt-4 pb-1 text-[9px] font-bold tracking-[.18em] text-blue-300/60">{title}</p>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-blue-700/70 text-white' : 'text-blue-100/75 hover:bg-white/10'}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="gestion-sidebar flex w-72 shrink-0 flex-col overflow-y-auto text-blue-50">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="gestion-logo">IC</span>
          <div>
            <p className="text-sm font-semibold">Gestión IC</p>
            <p className="text-[10px] text-blue-300">Proyectos corporativos</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 pb-3">
          {renderGroup('ESPACIO CORPORATIVO', general)}
          {renderGroup('PROYECTOS', proyectos)}
          {renderGroup('PORTAL DE SOLICITUDES', portal)}
          {renderGroup('LIDERAZGO', liderazgo)}
          {renderGroup('ADMINISTRACIÓN', administracion)}
          {renderGroup('INTEGRACIÓN BI · n8n (real)', bi)}
        </nav>
        <div className="mx-4 mb-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-200">
          ● Proyectos, solicitudes y usuarios son datos de demostración
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="flex w-full items-center gap-3 rounded-lg bg-white/5 p-2 text-left hover:bg-white/10">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold">{user.avatarIniciales}</span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-xs">{user.nombre}</b>
                <small className="block truncate text-[9px] text-blue-300">{roleName} · {area?.nombre ?? 'Sin área'}</small>
              </div>
            </button>
            {menuOpen ? (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xl">
                  <button onClick={() => { setMenuOpen(false); nav('/perfil') }} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs hover:bg-slate-50">
                    <UserCircle2 className="h-4 w-4" /> Mi perfil
                  </button>
                  <button onClick={() => { setMenuOpen(false); salir() }} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Cambiar de perfil / salir
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-7 py-3">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{user.nombre}</span> · {roleName} · {area?.nombre ?? 'Sin área asignada'}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={() => nav('/perfil')} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Perfil">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="p-7">{children}</main>
      </div>
    </div>
  )
}
