import { useEffect, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { bitacoraService } from '../../services/bitacoraService'
import type { BitacoraEvento } from '../../types'
import { Card } from '../../components/ui/Card'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Feedback'
import { formatFechaHora } from '../../lib/format'

export function BitacoraPage() {
  const { rolEfectivo } = useAuth()
  const [eventos, setEventos] = useState<BitacoraEvento[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    bitacoraService.obtener(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) setEventos(res.data)
      else setError(res.error.message)
    })
  }, [rolEfectivo])

  if (error) return <ErrorState description={error} />
  if (!eventos) return <LoadingState label="Cargando bitácora…" />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Bitácora</h1>
        <p className="mt-1 text-sm text-ic-slate">Registro de acciones críticas realizadas en el portal.</p>
      </div>

      {eventos.length === 0 ? (
        <EmptyState icon={<ScrollText className="h-6 w-6" />} title="Sin eventos" description="Aún no se han registrado acciones críticas." />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-ic-line">
            {eventos.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-ic-ink">{e.detalle}</p>
                  <p className="mt-0.5 text-xs text-ic-slate">
                    {e.actorNombre} · {e.accion}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-ic-slate">{formatFechaHora(e.fecha)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
