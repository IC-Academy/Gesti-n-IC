import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { RequireAuth, RequirePermission } from './routes/guards'
import { PublicLayout } from './components/layout/PublicLayout'
import { AppShell } from './components/layout/AppShell'

import { LandingPage } from './pages/public/LandingPage'
import { SolicitarProyectoPage } from './pages/public/SolicitarProyectoPage'
import { ConsultarEstatusPage } from './pages/public/ConsultarEstatusPage'
import { LoginPage } from './pages/public/LoginPage'
import { NotFoundPage } from './pages/public/NotFoundPage'

import { AppIndexRedirect } from './pages/app/AppIndexRedirect'
import { DashboardPage } from './pages/app/DashboardPage'
import { SolicitudesBandejaPage } from './pages/app/SolicitudesBandejaPage'
import { SolicitudDetallePage } from './pages/app/SolicitudDetallePage'
import { ProyectosListPage } from './pages/app/ProyectosListPage'
import { ProyectoDetallePage } from './pages/app/ProyectoDetallePage'
import { ActividadDetallePage } from './pages/app/ActividadDetallePage'
import { MisActividadesPage } from './pages/app/MisActividadesPage'
import { UsuariosPage } from './pages/app/UsuariosPage'
import { BitacoraPage } from './pages/app/BitacoraPage'
import { ConfiguracionPage } from './pages/app/ConfiguracionPage'
import { NoAutorizadoPage } from './pages/app/NoAutorizadoPage'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Portal público */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/solicitar" element={<SolicitarProyectoPage />} />
              <Route path="/estatus" element={<ConsultarEstatusPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />

            {/* Portal interno */}
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<AppIndexRedirect />} />
                <Route path="no-autorizado" element={<NoAutorizadoPage />} />

                <Route element={<RequirePermission anyOf={['dashboard.ver']} />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['solicitudes.ver_todas']} />}>
                  <Route path="solicitudes" element={<SolicitudesBandejaPage />} />
                  <Route path="solicitudes/:id" element={<SolicitudDetallePage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['proyectos.ver_todos', 'proyectos.ver_asignados']} />}>
                  <Route path="proyectos" element={<ProyectosListPage />} />
                  <Route path="proyectos/:id" element={<ProyectoDetallePage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['actividades.editar_cualquiera', 'actividades.ver_propias']} />}>
                  <Route path="actividades/:id" element={<ActividadDetallePage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['actividades.ver_propias']} />}>
                  <Route path="mis-actividades" element={<MisActividadesPage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['usuarios.gestionar']} />}>
                  <Route path="usuarios" element={<UsuariosPage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['bitacora.ver']} />}>
                  <Route path="bitacora" element={<BitacoraPage />} />
                </Route>

                <Route element={<RequirePermission anyOf={['configuracion.administrar']} />}>
                  <Route path="configuracion" element={<ConfiguracionPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  )
}
