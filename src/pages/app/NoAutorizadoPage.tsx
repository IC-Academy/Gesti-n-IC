import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export function NoAutorizadoPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldOff className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold text-ic-ink">No tienes acceso a esta sección</h1>
      <p className="max-w-sm text-sm text-ic-slate">
        Tu perfil actual no cuenta con permisos para ver este contenido. Si crees que es un error, contacta a tu
        administrador.
      </p>
      <Button onClick={() => history.back()} variant="outline">
        Regresar
      </Button>
      <Link to="/app/dashboard" className="text-sm font-medium text-ic-blue-700 hover:underline">
        Ir al inicio
      </Link>
    </div>
  )
}
