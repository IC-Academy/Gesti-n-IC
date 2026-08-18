import { useSession } from '@/lib/session'
import { ProjectsListPage } from './ProjectsListPage'

/** Un solo punto de entrada de navegación ("/proyectos") que muestra el alcance correcto según el rol. */
export function ProyectosPorRol() {
  const { user } = useSession()
  if (!user) return null
  if (user.rol === 'usuario') return <ProjectsListPage scope="own" title="Mis trabajos asignados" subtitle="Intervenciones donde participas como técnico responsable o integrante de cuadrilla." />
  if (user.rol === 'lider') return <ProjectsListPage scope="area" title="Intervenciones del equipo" subtitle="Mantenimiento mayor coordinado por tu cuadrilla." />
  return <ProjectsListPage scope="all" title="Portafolio de mantenimiento" subtitle="Intervenciones mayores de inmuebles e instalaciones." />
}
