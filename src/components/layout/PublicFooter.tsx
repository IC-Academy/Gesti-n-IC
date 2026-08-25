import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { DemoBadge } from '../ui/DemoBadge'

export function PublicFooter() {
  return (
    <footer className="border-t border-ic-line bg-ic-blue-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Portal para el registro, seguimiento y validación de solicitudes de mantenimiento, adecuaciones
              e instalaciones.
            </p>
            <div className="mt-4">
              <DemoBadge />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Portal</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-white/80">
                <li>
                  <Link to="/solicitar" className="hover:text-white">
                    Solicitar proyecto
                  </Link>
                </li>
                <li>
                  <Link to="/estatus" className="hover:text-white">
                    Consultar estatus
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Dominios válidos</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-white/80">
                <li>@intercon.com.mx</li>
                <li>@icsecurity.com</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Gestión IC — Inmuebles e Instalaciones. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
