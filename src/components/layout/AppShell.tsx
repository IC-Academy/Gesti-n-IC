import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X, UserCog, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { DemoBadge } from '../ui/DemoBadge'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { ROLES, ROL_LABEL } from '../../types'
import { can } from '../../lib/permissions'
import { classNames } from '../../lib/format'

export function AppShell() {
  const { usuario, rolEfectivo, rolSimulado, simularRol, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [simMenuAbierto, setSimMenuAbierto] = useState(false)
  const navigate = useNavigate()

  if (!usuario) return null

  const salir = () => {
    cerrarSesion()
    // Recarga completa hacia el portal público: evita cualquier condición de
    // carrera entre el guard de autenticación (que redirigiría a /login con
    // un estado "from" obsoleto) y la navegación de salida, y garantiza que
    // ningún estado en memoria del área privada sobreviva al cierre de sesión.
    window.location.assign('/')
  }

  return (
    <div className="flex min-h-screen bg-ic-bg">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ic-blue-900 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo dark />
        </div>
        <Sidebar rol={rolEfectivo} />
        <div className="border-t border-white/10 p-4">
          <DemoBadge />
        </div>
      </aside>

      {/* Sidebar móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuAbierto(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-ic-blue-900">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo dark />
              <button onClick={() => setMenuAbierto(false)} className="rounded-md p-1 text-white/80 focus-ring" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar rol={rolEfectivo} onNavigate={() => setMenuAbierto(false)} />
            <div className="border-t border-white/10 p-4">
              <DemoBadge />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ic-line bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAbierto(true)}
              className="rounded-md p-2 text-ic-ink lg:hidden focus-ring"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            {rolSimulado && (
              <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 sm:flex">
                <UserCog className="h-3.5 w-3.5" /> Simulando: {ROL_LABEL[rolSimulado]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {can(usuario.rol, 'simulacion.entrar_como_otro_rol') && (
              <div className="relative">
                <button
                  onClick={() => setSimMenuAbierto((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-ic-line px-3 py-2 text-xs font-medium text-ic-slate hover:bg-ic-blue-50 focus-ring"
                >
                  <UserCog className="h-4 w-4" />
                  <span className="hidden sm:inline">Vista simulada</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {simMenuAbierto && (
                  <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-ic-line bg-white p-1.5 shadow-ic-md">
                    <button
                      onClick={() => {
                        simularRol(null)
                        setSimMenuAbierto(false)
                        navigate('/app/dashboard')
                      }}
                      className={classNames(
                        'block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ic-blue-50',
                        !rolSimulado && 'font-semibold text-ic-blue-900',
                      )}
                    >
                      Mi rol ({ROL_LABEL[usuario.rol]})
                    </button>
                    {ROLES.filter((r) => r !== 'ADMIN').map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          simularRol(r)
                          setSimMenuAbierto(false)
                          navigate(r === 'PERSONAL_MANTENIMIENTO' ? '/app/mis-actividades' : '/app/dashboard')
                        }}
                        className={classNames(
                          'block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-ic-blue-50',
                          rolSimulado === r && 'font-semibold text-ic-blue-900',
                        )}
                      >
                        {ROL_LABEL[r]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ic-ink">{usuario.nombre}</p>
              <p className="text-xs leading-tight text-ic-slate">{ROL_LABEL[usuario.rol]}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ic-blue-100 text-sm font-semibold text-ic-blue-900">
              {usuario.nombre.slice(0, 1).toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={salir} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
