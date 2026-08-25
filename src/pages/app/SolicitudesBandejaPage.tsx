import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { solicitudesService } from '../../services/solicitudesService'
import type { EstatusSolicitud, Solicitud } from '../../types'
import { ESTATUS_SOLICITUD_LABEL } from '../../types'
import { Card, CardBody } from '../../components/ui/Card'
import { EstatusSolicitudBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import { formatFecha } from '../../lib/format'

const FILTROS: { valor: EstatusSolicitud | 'TODAS' | 'PENDIENTES'; etiqueta: string }[] = [
  { valor: 'PENDIENTES', etiqueta: 'Pendientes de revisión' },
  { valor: 'TODAS', etiqueta: 'Todas' },
  { valor: 'RECIBIDA', etiqueta: ESTATUS_SOLICITUD_LABEL.RECIBIDA },
  { valor: 'EN_REVISION', etiqueta: ESTATUS_SOLICITUD_LABEL.EN_REVISION },
  { valor: 'AUTORIZADA', etiqueta: ESTATUS_SOLICITUD_LABEL.AUTORIZADA },
  { valor: 'RECHAZADA', etiqueta: ESTATUS_SOLICITUD_LABEL.RECHAZADA },
  { valor: 'CANCELADA', etiqueta: ESTATUS_SOLICITUD_LABEL.CANCELADA },
  { valor: 'CONVERTIDA_PROYECTO', etiqueta: ESTATUS_SOLICITUD_LABEL.CONVERTIDA_PROYECTO },
]

export function SolicitudesBandejaPage() {
  const { rolEfectivo } = useAuth()
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]['valor']>('PENDIENTES')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    let activo = true
    solicitudesService.listar(rolEfectivo ?? undefined).then((res) => {
      if (!activo) return
      if (res.ok) setSolicitudes(res.data)
      else setError(res.error.message)
    })
    return () => {
      activo = false
    }
  }, [rolEfectivo])

  const filtradas = useMemo(() => {
    if (!solicitudes) return []
    let base = solicitudes
    if (filtro === 'PENDIENTES') base = base.filter((s) => s.estatus === 'RECIBIDA' || s.estatus === 'EN_REVISION')
    else if (filtro !== 'TODAS') base = base.filter((s) => s.estatus === filtro)
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      base = base.filter(
        (s) => s.folio.toLowerCase().includes(q) || s.nombreCompleto.toLowerCase().includes(q) || s.area.toLowerCase().includes(q),
      )
    }
    return base
  }, [solicitudes, filtro, busqueda])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Bandeja de solicitudes</h1>
        <p className="mt-1 text-sm text-ic-slate">Revisa, autoriza o rechaza las solicitudes registradas por el público.</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Select label="Filtrar por estatus" value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)} className="sm:w-64">
              {FILTROS.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.etiqueta}
                </option>
              ))}
            </Select>
            <Input
              label="Buscar"
              placeholder="Folio, nombre o área"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="sm:w-72"
            />
          </div>
        </CardBody>
      </Card>

      {!solicitudes && !error && <LoadingState label="Cargando solicitudes…" />}
      {error && <ErrorState description={error} />}

      {solicitudes && (
        <Card className="overflow-hidden p-0">
          {filtradas.length === 0 ? (
            <EmptyState icon={<Inbox className="h-6 w-6" />} title="Sin resultados" description="No hay solicitudes que coincidan con el filtro seleccionado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ic-line text-xs uppercase tracking-wide text-ic-slate">
                  <tr>
                    <th className="px-6 py-3 font-medium">Folio</th>
                    <th className="px-6 py-3 font-medium">Solicitante</th>
                    <th className="px-6 py-3 font-medium">Área</th>
                    <th className="px-6 py-3 font-medium">Prioridad</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                    <th className="px-6 py-3 font-medium">Registrada</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((s) => (
                    <tr key={s.id} className="border-b border-ic-line last:border-b-0 hover:bg-ic-blue-50/40">
                      <td className="px-6 py-3">
                        <Link to={`/app/solicitudes/${s.id}`} className="font-medium text-ic-blue-800 hover:underline">
                          {s.folio}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-ic-ink">{s.nombreCompleto}</td>
                      <td className="px-6 py-3 text-ic-slate">{s.area}</td>
                      <td className="px-6 py-3">{s.prioridad ? <PrioridadBadge prioridad={s.prioridad} /> : <span className="text-ic-slate">—</span>}</td>
                      <td className="px-6 py-3">
                        <EstatusSolicitudBadge estatus={s.estatus} />
                      </td>
                      <td className="px-6 py-3 text-ic-slate">{formatFecha(s.creadoEn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
