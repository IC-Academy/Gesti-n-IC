import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { StatusBadge } from '@/components/gestion/StatusBadge'
import { PriorityBadge } from '@/components/gestion/PriorityBadge'
import { PROJECT_STATUSES, PRIORITIES, STATUS_META, TRANSICIONES_PERMITIDAS } from '@/lib/catalog'
import { resetDemoData } from '@/lib/demoStore'

export function Catalogos() {
  const [confirmar, setConfirmar] = useState(false)
  const [reiniciado, setReiniciado] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <p className="gestion-kicker">GOBIERNO DEL PORTAL</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Catálogos</h1>
        <p className="text-sm text-slate-500">
          Catálogo centralizado de estados y prioridades. Se define en <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">src/lib/catalog.ts</code> para
          que todas las pantallas usen exactamente la misma fuente de verdad.
        </p>
      </div>

      <Card>
        <CardHeader title="Estados del ciclo de vida" subtitle="Flujo de una solicitud desde que se recibe hasta que el proyecto se cierra." />
        <CardBody className="overflow-auto">
          <table className="gestion-table">
            <thead>
              <tr><th>#</th><th>ESTADO</th><th>GRUPO</th><th>DESCRIPCIÓN</th><th>PUEDE PASAR A</th></tr>
            </thead>
            <tbody>
              {PROJECT_STATUSES.map((s) => (
                <tr key={s}>
                  <td>{STATUS_META[s].orden}</td>
                  <td><StatusBadge estado={s} /></td>
                  <td className="capitalize">{STATUS_META[s].grupo}</td>
                  <td>{STATUS_META[s].descripcion}</td>
                  <td>{TRANSICIONES_PERMITIDAS[s].length ? TRANSICIONES_PERMITIDAS[s].join(', ') : '— (estado final)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Prioridades" />
        <CardBody className="flex gap-3">
          {PRIORITIES.map((p) => <PriorityBadge key={p} prioridad={p} />)}
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Datos de demostración" subtitle="Restablece áreas, usuarios, proyectos y solicitudes a la semilla inicial." />
        <CardBody className="space-y-3">
          {reiniciado ? <Alert tone="success">Datos de demostración restablecidos.</Alert> : null}
          {confirmar ? (
            <Alert tone="warning" title="¿Seguro?">
              Esto reemplaza todos los cambios hechos durante esta demostración (usuarios, proyectos, solicitudes, evidencias) por los datos de ejemplo originales.
              <div className="mt-3 flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    resetDemoData()
                    setConfirmar(false)
                    setReiniciado(true)
                  }}
                >
                  Sí, restablecer
                </Button>
                <Button variant="secondary" onClick={() => setConfirmar(false)}>Cancelar</Button>
              </div>
            </Alert>
          ) : (
            <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmar(true)}>
              Restablecer datos de demostración
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
