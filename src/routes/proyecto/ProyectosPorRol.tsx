import { useSession } from '@/lib/session'
import { ProjectsListPage } from './ProjectsListPage'

/** Un solo punto de entrada de navegación ("/proyectos") que muestra el alcance correcto según el rol. */
export function ProyectosPorRol() {
  const { user } = useSession()
  if (!user) return null
  if (user.rol === 'usuario') return <ProjectsListPage scope="own" title="Mis proyectos" subtitle="Proyectos donde participas como responsable o colaborador." />
  if (user.rol === 'lider') return <ProjectsListPage scope="area" title="Proyectos del equipo" subtitle="Portafolio de proyectos de tu área." />
  return <ProjectsListPage scope="all" title="Todos los proyectos" subtitle="Portafolio completo de Gestión IC." />
}
