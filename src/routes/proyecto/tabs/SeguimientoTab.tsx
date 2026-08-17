import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Alert } from '@/components/gestion/Alert'
import { EvidenceUploader } from '@/components/gestion/EvidenceUploader'
import { EmptyState } from '@/components/States'
import { useDemoStore, registrarAvance } from '@/lib/demoStore'
import { avancesDeProyecto, usuarioPorId } from '@/lib/demoSelectors'
import { useSession } from '@/lib/session'
import type { EvidenceRef, Project } from '@/lib/types'

export function SeguimientoTab({ project }: { project: Project }) {
  const state = useDemoStore()
  const { user } = useSession()
  const [avance, setAvance] = useState(project.avance)
  const [resumen, setResumen] = useState('')
  const [bloqueado, setBloqueado] = useState(false)
  const [motivoBloqueo, setMotivoBloqueo] = useState('')
  const [evidencias, setEvidencias] = useState<EvidenceRef[]>([])
  const [enviado, setEnviado] = useState(false)

  if (!user) return null
  const historial = avancesDeProyecto(state, project.id)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resumen.trim()) return
    registrarAvance({ projectId: project.id, autorId: user!.id, avance, resumen: resumen.trim(), bloqueado, motivoBloqueo: bloqueado ? motivoBloqueo.trim() : undefined, evidencias })
    setResumen('')
    setEvidencias([])
    setBloqueado(false)
    setMotivoBloqueo('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 4000)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader title="Registrar avance" subtitle="Actualiza el porcentaje, describe lo realizado y adjunta evidencia." />
        <CardBody>
          {enviado ? <div className="mb-4"><Alert tone="success">Avance registrado correctamente.</Alert></div> : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-slate-600">
                Porcentaje de avance <span className="text-blue-600">{avance}%</span>
              </label>
              <input type="range" min={0} max={100} value={avance} onChange={(e) => setAvance(Number(e.target.value))} className="mt-2 w-full accent-blue-700" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Resumen del avance</label>
              <textarea
                required
                rows={4}
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                placeholder="Describe qué se completó, resultados y siguientes pasos."
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input type="checkbox" checked={bloqueado} onChange={(e) => setBloqueado(e.target.checked)} /> Este proyecto tiene un bloqueo
              </label>
              {bloqueado ? (
                <textarea
                  required
                  rows={2}
                  value={motivoBloqueo}
                  onChange={(e) => setMotivoBloqueo(e.target.value)}
                  placeholder="Describe el impedimento para que tu líder pueda ayudarte a resolverlo."
                  className="mt-2 w-full rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm"
                />
              ) : null}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Evidencias de este avance</label>
              <div className="mt-2">
                <EvidenceUploader value={evidencias} onChange={setEvidencias} />
              </div>
            </div>
            <Button type="submit" icon={<PlusCircle className="h-4 w-4" />} className="w-full">
              Publicar actualización
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Avances anteriores" subtitle={`${historial.length} actualización(es) registradas`} />
        <CardBody className="max-h-[560px] space-y-4 overflow-y-auto">
          {historial.length === 0 ? (
            <EmptyState label="Aún no hay avances registrados." />
          ) : (
            historial.map((h) => {
              const autor = usuarioPorId(state, h.autorId)
              return (
                <div key={h.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="avatar-mini">{autor?.avatarIniciales ?? '—'}</span> {autor?.nombre ?? 'Usuario'}
                    </span>
                    <span className="text-slate-400">{new Date(h.fecha).toLocaleString('es-MX')}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{h.resumen}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 font-bold text-blue-700">{h.avance}% de avance</span>
                    {h.bloqueado ? <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-700">Bloqueo reportado</span> : null}
                    {h.evidenciaIds.length ? <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{h.evidenciaIds.length} evidencia(s)</span> : null}
                  </div>
                </div>
              )
            })
          )}
        </CardBody>
      </Card>
    </div>
  )
}
