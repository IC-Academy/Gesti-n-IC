import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider, useSession } from '@/lib/session'
import { Layout } from '@/components/Layout'
import { PortalShell } from '@/components/PortalShell'
import { RequireRole } from '@/components/gestion/RouteGuard'

import { Acceso } from '@/routes/Acceso'
import { Dashboard } from '@/routes/Dashboard'
import { NuevaSolicitud } from '@/routes/portal/NuevaSolicitud'
import { ConsultaEstatus } from '@/routes/portal/ConsultaEstatus'
import { ProyectosPorRol } from '@/routes/proyecto/ProyectosPorRol'
import { DetalleProyecto } from '@/routes/proyecto/DetalleProyecto'
import { SolicitudesPorRol } from '@/routes/solicitud/SolicitudesPorRol'
import { DetalleSolicitud } from '@/routes/solicitud/DetalleSolicitud'
import { Asignacion } from '@/routes/lider/Asignacion'
import { CargaTrabajo } from '@/routes/lider/CargaTrabajo'
import { ValidacionEvidencias } from '@/routes/lider/ValidacionEvidencias'
import { Alertas } from '@/routes/lider/Alertas'
import { Usuarios } from '@/routes/admin/Usuarios'
import { RolesPermisos } from '@/routes/admin/RolesPermisos'
import { AreasLideres } from '@/routes/admin/AreasLideres'
import { Catalogos } from '@/routes/admin/Catalogos'
import { Auditoria } from '@/routes/admin/Auditoria'
import { Perfil } from '@/routes/general/Perfil'
import { NotFound } from '@/routes/general/NotFound'

import { BandejaBI } from '@/routes/BandejaBI'
import { RegistrarSolicitud } from '@/routes/RegistrarSolicitud'
import { ConsultarSolicitud } from '@/routes/ConsultarSolicitud'
import { EvaluacionBI } from '@/routes/EvaluacionBI'
import { CentroAutorizaciones } from '@/routes/CentroAutorizaciones'

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </SessionProvider>
  )
}

function AppRoutes() {
  const { user } = useSession()

  return (
    <Routes>
      {/* Portal del solicitante, público / semipúblico: no requiere iniciar sesión. */}
      <Route path="/publico/nueva-solicitud" element={<PortalShell><NuevaSolicitud /></PortalShell>} />
      <Route path="/publico/consultar" element={<PortalShell><ConsultaEstatus /></PortalShell>} />

      <Route path="/*" element={user ? <AreaAutenticada /> : <Acceso />} />
    </Routes>
  )
}

function AreaAutenticada() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/resumen" replace />} />
        <Route path="/resumen" element={<Dashboard />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* Portal de solicitudes (nuevo, demo) */}
        <Route path="/portal/nueva-solicitud" element={<NuevaSolicitud />} />
        <Route path="/portal/consultar" element={<ConsultaEstatus />} />

        {/* Proyectos (usuario: propios · líder: área · admin: todos) */}
        <Route path="/proyectos" element={<ProyectosPorRol />} />
        <Route path="/proyectos/:id" element={<DetalleProyecto />} />

        {/* Liderazgo: solicitudes, asignación, equipo, evidencias, alertas */}
        <Route path="/solicitudes" element={<RequireRole roles={['lider', 'admin']}><SolicitudesPorRol /></RequireRole>} />
        <Route path="/solicitudes/:id" element={<RequireRole roles={['lider', 'admin']}><DetalleSolicitud /></RequireRole>} />
        <Route path="/asignacion" element={<RequireRole roles={['lider', 'admin']}><Asignacion /></RequireRole>} />
        <Route path="/equipo/carga" element={<RequireRole roles={['lider', 'admin']}><CargaTrabajo /></RequireRole>} />
        <Route path="/evidencias/validacion" element={<RequireRole roles={['lider', 'admin']}><ValidacionEvidencias /></RequireRole>} />
        <Route path="/alertas" element={<RequireRole roles={['lider', 'admin']}><Alertas /></RequireRole>} />

        {/* Administración */}
        <Route path="/admin/usuarios" element={<RequireRole roles={['admin']}><Usuarios /></RequireRole>} />
        <Route path="/admin/roles" element={<RequireRole roles={['admin']}><RolesPermisos /></RequireRole>} />
        <Route path="/admin/areas" element={<RequireRole roles={['admin']}><AreasLideres /></RequireRole>} />
        <Route path="/admin/catalogos" element={<RequireRole roles={['admin']}><Catalogos /></RequireRole>} />
        <Route path="/admin/auditoria" element={<RequireRole roles={['admin']}><Auditoria /></RequireRole>} />

        {/* Integración real con n8n/Airtable (PBI-01..07) — sin cambios de contrato */}
        <Route path="/bi/registrar" element={<RegistrarSolicitud />} />
        <Route path="/bi/consultar" element={<ConsultarSolicitud />} />
        <Route path="/bi/bandeja" element={<RequireRole roles={['lider', 'admin']}><BandejaBI /></RequireRole>} />
        <Route path="/bi/evaluacion/:folio" element={<RequireRole roles={['lider', 'admin']}><EvaluacionBI /></RequireRole>} />
        <Route path="/bi/autorizaciones" element={<RequireRole roles={['lider', 'admin']}><CentroAutorizaciones /></RequireRole>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
