import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '../ui/Button'
import { classNames } from '../../lib/format'

const ENLACES = [
  { to: '/', label: 'Inicio' },
  { to: '/solicitar', label: 'Solicitar proyecto' },
  { to: '/estatus', label: 'Consultar estatus' },
]

export function PublicHeader() {
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-ic-line bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="focus-ring rounded-md">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.to === '/'}
              className={({ isActive }) =>
                classNames(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                  isActive ? 'bg-ic-blue-50 text-ic-blue-900' : 'text-ic-slate hover:bg-ic-blue-50 hover:text-ic-ink',
                )
              }
            >
              {e.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Button>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ic-ink md:hidden focus-ring"
          onClick={() => setAbierto((v) => !v)}
          aria-label="Abrir menú de navegación"
          aria-expanded={abierto}
        >
          {abierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {abierto && (
        <div className="border-t border-ic-line bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {ENLACES.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                end={e.to === '/'}
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  classNames(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-ic-blue-50 text-ic-blue-900' : 'text-ic-slate hover:bg-ic-blue-50',
                  )
                }
              >
                {e.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setAbierto(false)}
              className="mt-1 flex items-center gap-2 rounded-lg bg-ic-blue-900 px-3 py-2.5 text-sm font-semibold text-white"
            >
              <LogIn className="h-4 w-4" /> Iniciar sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
