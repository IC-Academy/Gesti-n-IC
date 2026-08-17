import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, ClipboardList, FileSearch, Inbox, ShieldCheck, Settings, Users, FolderKanban, LogOut } from 'lucide-react'
import type { RolGestion } from '@/App'
export function Layout({children,rol,onExit}:{children:ReactNode;rol:RolGestion;onExit:()=>void}) {
 const items=[
  ['/resumen','Resumen',BarChart3,true],['/registrar','Nueva solicitud',ClipboardList,true],['/consultar','Mis solicitudes',FileSearch,true],
  ['/proyectos',rol==='usuario'?'Mis proyectos':'Portafolio',FolderKanban,true],['/bandeja','Solicitudes del área',Inbox,rol!=='usuario'],
  ['/autorizaciones','Autorizaciones',ShieldCheck,rol!=='usuario'],['/equipo','Mi equipo',Users,rol==='lider'],['/administracion','Administración',Settings,rol==='admin'],
 ] as const
 const roleName=rol==='admin'?'Administrador':rol==='lider'?'Líder de área':'Usuario'
 return <div className="flex min-h-screen bg-slate-50"><aside className="gestion-sidebar flex w-64 shrink-0 flex-col text-blue-50">
  <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5"><span className="gestion-logo">IC</span><div><p className="text-sm font-semibold">Gestión IC</p><p className="text-[10px] text-blue-300">Proyectos corporativos</p></div></div>
  <p className="px-5 pt-5 text-[9px] font-bold tracking-[.18em] text-blue-300/60">ESPACIO CORPORATIVO</p>
  <nav className="flex-1 space-y-1 px-3 py-3">{items.filter(x=>x[3]).map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive?'bg-blue-700/70 text-white':'text-blue-100/75 hover:bg-white/10'}`}><Icon className="h-4 w-4"/>{label}</NavLink>)}</nav>
  <div className="mx-4 mb-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-200">● Modo demostración</div>
  <div className="border-t border-white/10 p-3"><div className="flex items-center gap-3 rounded-lg bg-white/5 p-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-[10px] font-bold">JM</span><div className="flex-1"><b className="block text-xs">Jorge Mejía</b><small className="text-[9px] text-blue-300">{roleName}</small></div><button onClick={onExit} title="Cambiar perfil"><LogOut className="h-4 w-4"/></button></div></div>
 </aside><div className="min-w-0 flex-1"><div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-[10px] text-amber-800"><strong>Modo de pruebas:</strong> los correos continúan redirigidos al buzón interno de validación (SEND_REAL_EMAILS=false).</div><main className="p-7">{children}</main></div></div>
}
