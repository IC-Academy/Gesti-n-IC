import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/Button'

/**
 * Página 404 compatible con GitHub Pages: como la app usa HashRouter, la ruta
 * real que sirve GitHub Pages siempre es index.html (el "#/lo-que-sea" lo
 * interpreta React Router en el navegador), así que refrescar una ruta
 * desconocida NUNCA devuelve un 404 del servidor ni deja la app en blanco:
 * cae aquí.
 */
export function NotFound() {
  const nav = useNavigate()
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
      <div>
        <Compass className="mx-auto h-12 w-12 text-blue-500" />
        <p className="gestion-kicker mt-4">ERROR 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">No encontramos esta página</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          La dirección a la que intentaste entrar no existe o ya no está disponible en Gestión IC.
        </p>
        <Button className="mt-6" onClick={() => nav('/resumen')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
