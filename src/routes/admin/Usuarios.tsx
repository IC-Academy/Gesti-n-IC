import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Users } from 'lucide-react'
import { useDemoStore, crearUsuario, actualizarUsuario, asignarRol, cambiarAreaUsuario } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { Button } from '@/components/Button'
import { Field, inputClass } from '@/components/Field'
import { KpiRow } from '@/components/gestion/KpiRow'
import type { Role } from '@/lib/types'
import { ShieldCheck, UserCheck } from 'lucide-react'

interface NuevoUsuarioForm {
  nombre: string
  correo: string
  rol: Role
  areaId: string
  puesto: string
}

export function Usuarios() {
  const state = useDemoStore()
  const { user } = useSession()
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset } = useForm<NuevoUsuarioForm>({ defaultValues: { rol: 'usuario', areaId: state.areas[0]?.id } })

  if (!user) return null

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="gestion-kicker">GOBIERNO DEL PORTAL</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Administración de usuarios</h1>
          <p className="text-sm text-slate-500">Crea, edita, activa/desactiva usuarios y asigna roles y áreas.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalAbierto(true)}>Nuevo usuario</Button>
      </div>

      <KpiRow
        items={[
          { icon: Users, value: state.users.filter((u) => u.activo).length, label: 'USUARIOS ACTIVOS', tone: 0 },
          { icon: ShieldCheck, value: state.users.filter((u) => u.rol === 'lider').length, label: 'LÍDERES DE ÁREA', tone: 1 },
          { icon: UserCheck, value: state.users.filter((u) => u.rol === 'admin').length, label: 'ADMINISTRADORES', tone: 2 },
          { icon: Users, value: state.users.filter((u) => !u.activo).length, label: 'USUARIOS INACTIVOS', tone: 3 },
        ]}
      />

      <section className="gestion-panel overflow-auto">
        <table className="gestion-table">
          <thead>
            <tr><th>USUARIO</th><th>ÁREA</th><th>ROL</th><th>ESTADO</th><th>ACCIONES</th></tr>
          </thead>
          <tbody>
            {state.users.map((u) => (
              <tr key={u.id}>
                <td><b>{u.nombre}</b><small>{u.correo}</small></td>
                <td>
                  <select defaultValue={u.areaId} onChange={(e) => cambiarAreaUsuario(u.id, e.target.value, user.id)}>
                    {state.areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </td>
                <td>
                  <select defaultValue={u.rol} onChange={(e) => asignarRol(u.id, e.target.value as Role, user.id)}>
                    <option value="usuario">Usuario</option>
                    <option value="lider">Líder</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => actualizarUsuario(u.id, { activo: !u.activo }, user.id)}
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {u.activo ? '● Activo' : '○ Inactivo'}
                  </button>
                </td>
                <td className="text-[10px] text-slate-400">Alta: {new Date(u.creadoEn).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {modalAbierto ? (
        <div className="gestion-modal">
          <form
            onSubmit={handleSubmit((values) => {
              crearUsuario({ ...values, activo: true }, user.id)
              reset()
              setModalAbierto(false)
            })}
          >
            <div className="flex justify-between">
              <div>
                <p className="gestion-kicker">NUEVO USUARIO</p>
                <h2 className="text-xl font-semibold">Crear usuario</h2>
              </div>
              <button type="button" onClick={() => setModalAbierto(false)}>×</button>
            </div>
            <Field label="Nombre completo" required>
              <input className={inputClass()} required {...register('nombre')} />
            </Field>
            <Field label="Correo" required hint="No uses correos reales; usa el dominio de demostración.">
              <input type="email" className={inputClass()} required placeholder="nombre@iccorp-demo.mx" {...register('correo')} />
            </Field>
            <Field label="Puesto">
              <input className={inputClass()} {...register('puesto')} />
            </Field>
            <Field label="Rol" required>
              <select className={inputClass()} {...register('rol')}>
                <option value="usuario">Usuario</option>
                <option value="lider">Líder</option>
                <option value="admin">Administrador</option>
              </select>
            </Field>
            <Field label="Área" required>
              <select className={inputClass()} {...register('areaId')}>
                {state.areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button type="button" className="gestion-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="gestion-primary">Crear usuario</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
