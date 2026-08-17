import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Field, inputClass } from '@/components/Field'
import { useDemoStore, crearArea, actualizarArea, asignarLiderArea } from '@/lib/demoStore'
import { proyectosDeArea } from '@/lib/demoSelectors'
import { useSession } from '@/lib/session'

export function AreasLideres() {
  const state = useDemoStore()
  const { user } = useSession()
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ nombre: string; descripcion: string }>()

  if (!user) return null

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="gestion-kicker">GOBIERNO DEL PORTAL</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Áreas y líderes</h1>
          <p className="text-sm text-slate-500">Administra las áreas de la organización y quién las lidera.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalAbierto(true)}>Nueva área</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {state.areas.map((area) => {
          const posiblesLideres = state.users.filter((u) => (u.rol === 'lider' || u.rol === 'admin') && u.activo)
          const proyectosActivos = proyectosDeArea(state, area.id).filter((p) => p.estado !== 'Finalizada' && p.estado !== 'Cancelada').length
          return (
            <Card key={area.id}>
              <CardHeader
                title={area.nombre}
                subtitle={area.descripcion}
                action={
                  <button
                    onClick={() => actualizarArea(area.id, { activa: !area.activa }, user.id)}
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${area.activa ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {area.activa ? '● Activa' : '○ Inactiva'}
                  </button>
                }
              />
              <CardBody className="space-y-3">
                <div>
                  <p className="gestion-kicker mb-1">LÍDER DE ÁREA</p>
                  {!area.liderId ? <p className="mb-2 text-xs font-semibold text-amber-600">Sin líder asignado</p> : null}
                  <select
                    defaultValue={area.liderId ?? ''}
                    onChange={(e) => asignarLiderArea(area.id, e.target.value || undefined, user.id)}
                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs"
                  >
                    <option value="">Sin asignar</option>
                    {posiblesLideres.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500">{proyectosActivos} proyecto(s) activo(s) en esta área.</p>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {modalAbierto ? (
        <div className="gestion-modal">
          <form
            onSubmit={handleSubmit((values) => {
              crearArea({ ...values, activa: true }, user.id)
              reset()
              setModalAbierto(false)
            })}
          >
            <div className="flex justify-between">
              <div>
                <p className="gestion-kicker">NUEVA ÁREA</p>
                <h2 className="text-xl font-semibold">Crear área</h2>
              </div>
              <button type="button" onClick={() => setModalAbierto(false)}>×</button>
            </div>
            <Field label="Nombre" required>
              <input className={inputClass()} required {...register('nombre')} />
            </Field>
            <Field label="Descripción">
              <textarea className={inputClass()} {...register('descripcion')} />
            </Field>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button type="button" className="gestion-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="gestion-primary">Crear área</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
