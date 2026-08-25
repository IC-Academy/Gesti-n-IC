import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ic-blue-50 text-ic-blue-700">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-semibold text-ic-ink">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-ic-slate">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="inline-flex h-11 items-center justify-center rounded-lg bg-ic-blue-900 px-6 text-sm font-semibold text-white hover:bg-ic-blue-800 focus-ring">
        Volver al inicio
      </Link>
    </div>
  )
}
