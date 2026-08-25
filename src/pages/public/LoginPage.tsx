import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { Input } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { Logo } from '../../components/layout/Logo'
import { useAuth } from '../../context/AuthContext'
import { homeRouteForRole } from '../../lib/permissions'
import { useToast } from '../../context/ToastContext'

const CUENTAS_DEMO = [
  { usuario: '90001', rol: 'Administrador' },
  { usuario: '20001', rol: 'Líder (Diana López)' },
  { usuario: '30001', rol: 'Jefe de mantenimiento' },
  { usuario: '10001', rol: 'Personal de mantenimiento' },
]

export function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { notificar } = useToast()

  const destino = (location.state as { from?: Location })?.from?.pathname

  const enviar = async () => {
    setError(null)
    if (!usuario.trim() || !password.trim()) {
      setError('Ingresa tu usuario y contraseña.')
      return
    }
    setCargando(true)
    const resultado = await iniciarSesion(usuario.trim(), password)
    setCargando(false)
    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }
    notificar({ tipo: 'exito', titulo: 'Bienvenido(a)' })
    navigate(destino ?? homeRouteForRole(resultado.usuario.rol), { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-ic-blue-900">
      <div className="hidden flex-1 flex-col justify-between bg-ic-blue-900 p-12 text-white lg:flex">
        <Logo dark />
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Acceso interno para el equipo de Inmuebles e Instalaciones.
          </h2>
          <p className="mt-4 text-white/70">
            Gestiona solicitudes, proyectos y actividades desde un solo lugar, con permisos claros por rol.
          </p>
        </div>
        <p className="text-xs text-white/40">Gestión IC © {new Date().getFullYear()}</p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-ic-bg px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-ic-line bg-white px-4 py-2.5 text-sm font-semibold text-ic-blue-900 shadow-sm transition hover:border-ic-blue-200 hover:bg-ic-blue-50 focus-ring"
          >
            <ArrowLeft className="h-4 w-4" /> Regresar al portal público
          </Link>

          <div className="mb-2 flex lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold text-ic-ink">Iniciar sesión</h1>
          <p className="mt-1.5 text-sm text-ic-slate">Acceso exclusivo para personal interno.</p>

          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              void enviar()
            }}
            noValidate
          >
            <Input
              label="Usuario"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej. 20001"
              autoComplete="username"
            />
            <Input
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" loading={cargando} fullWidth>
              <KeyRound className="h-4 w-4" /> Entrar
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-ic-line bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ic-slate">Usuarios demo</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {CUENTAS_DEMO.map((c) => (
                <li key={c.usuario} className="flex items-center justify-between">
                  <span className="text-ic-ink">{c.rol}</span>
                  <span className="font-mono text-ic-slate">{c.usuario}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ic-slate">
              Contraseña temporal para todos: <span className="font-semibold text-ic-ink">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
