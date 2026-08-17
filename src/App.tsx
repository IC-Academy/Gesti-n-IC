import { useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Acceso, Resumen, Proyectos, Equipo, Administracion } from '@/routes/GestionDemo'
import { BandejaBI } from '@/routes/BandejaBI'
import { RegistrarSolicitud } from '@/routes/RegistrarSolicitud'
import { ConsultarSolicitud } from '@/routes/ConsultarSolicitud'
import { EvaluacionBI } from '@/routes/EvaluacionBI'
import { CentroAutorizaciones } from '@/routes/CentroAutorizaciones'
export type RolGestion = 'usuario' | 'lider' | 'admin'
export default function App() {
  const [rol, setRol] = useState<RolGestion | null>(() => { try { return sessionStorage.getItem('gestion_ic_rol') as RolGestion | null } catch { return null } })
  const entrar = (next: RolGestion) => { sessionStorage.setItem('gestion_ic_rol', next); setRol(next) }
  const salir = () => { sessionStorage.removeItem('gestion_ic_rol'); setRol(null) }
  if (!rol) return <Acceso onEnter={entrar} />
  return <HashRouter><Layout rol={rol} onExit={salir}><Routes>
    <Route path="/" element={<Navigate to="/resumen" replace />} />
    <Route path="/resumen" element={<Resumen rol={rol} />} />
    <Route path="/registrar" element={<RegistrarSolicitud />} />
    <Route path="/consultar" element={<ConsultarSolicitud />} />
    <Route path="/proyectos" element={<Proyectos rol={rol} />} />
    <Route path="/bandeja" element={rol === 'usuario' ? <Navigate to="/resumen" /> : <BandejaBI />} />
    <Route path="/evaluacion/:folio" element={rol === 'usuario' ? <Navigate to="/resumen" /> : <EvaluacionBI />} />
    <Route path="/autorizaciones" element={rol === 'usuario' ? <Navigate to="/resumen" /> : <CentroAutorizaciones />} />
    <Route path="/equipo" element={rol === 'lider' ? <Equipo /> : <Navigate to="/resumen" />} />
    <Route path="/administracion" element={rol === 'admin' ? <Administracion /> : <Navigate to="/resumen" />} />
    <Route path="*" element={<Navigate to="/resumen" replace />} />
  </Routes></Layout></HashRouter>
}
