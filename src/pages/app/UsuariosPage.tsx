import { useEffect, useState } from 'react'
import { Plus, UserCheck, UserX } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usuariosService } from '../../services/usuariosService'
import type { Rol, Usuario } from '../../types'
import { ROLES, ROL_LABEL } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useToast } from '../../context/ToastContext'

export function UsuariosPage() {
  const { usuario, rolEfectivo } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmarCambio, setConfirmarCambio] = useState<{ u: Usuario; activo: boolean } | null>(null)
  const { notificar } = useToast()

  const cargar = () => {
    usuariosService.listar(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) setUsuarios(res.data)
      else setError(res.error.message)
    })
  }

  useEffect(cargar, [rolEfectivo])

  const cambiarRol = async (u: Usuario, rol: Rol) => {
    if (!usuario) return
    const res = await usuariosService.actualizar(u.id, { rol }, rolEfectivo ?? undefined, usuario.nombre)
    if (res.ok) {
      setUsuarios((prev) => prev?.map((x) => (x.id === u.id ? res.data : x)) ?? null)
      notificar({ tipo: 'exito', titulo: 'Rol actualizado', descripcion: `${u.nombre} ahora es ${ROL_LABEL[rol]}.` })
    } else {
      notificar({ tipo: 'error', titulo: 'No se pudo cambiar el rol', descripcion: res.error.message })
    }
  }

  const confirmarActivarDesactivar = async () => {
    if (!confirmarCambio || !usuario) return
    const res = await usuariosService.actualizar(confirmarCambio.u.id, { activo: confirmarCambio.activo }, rolEfectivo ?? undefined, usuario.nombre)
    if (res.ok) {
      setUsuarios((prev) => prev?.map((x) => (x.id === confirmarCambio.u.id ? res.data : x)) ?? null)
      notificar({ tipo: 'exito', titulo: confirmarCambio.activo ? 'Usuario activado' : 'Usuario desactivado' })
    } else {
      notificar({ tipo: 'error', titulo: 'No se pudo actualizar', descripcion: res.error.message })
    }
    setConfirmarCambio(null)
  }

  if (error) return <ErrorState description={error} />
  if (!usuarios) return <LoadingState label="Cargando usuarios…" />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Usuarios</h1>
          <p className="mt-1 text-sm text-ic-slate">Gestiona cuentas, roles y estatus de acceso.</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="h-4 w-4" /> Nuevo usuario
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ic-line text-xs uppercase tracking-wide text-ic-slate">
              <tr>
                <th className="px-6 py-3 font-medium">Clave</th>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Área</th>
                <th className="px-6 py-3 font-medium">Estatus</th>
                <th className="px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-ic-line last:border-b-0 hover:bg-ic-blue-50/40">
                  <td className="px-6 py-3 font-mono text-ic-ink">{u.usuario}</td>
                  <td className="px-6 py-3 text-ic-ink">{u.nombre}</td>
                  <td className="px-6 py-3">
                    <Select value={u.rol} onChange={(e) => void cambiarRol(u, e.target.value as Rol)} className="h-8 w-56 text-xs">
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROL_LABEL[r]}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-6 py-3 text-ic-slate">{u.area ?? '—'}</td>
                  <td className="px-6 py-3">
                    <Badge tono={u.activo ? 'verde' : 'gris'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Button
                      size="sm"
                      variant={u.activo ? 'outline' : 'secondary'}
                      onClick={() => setConfirmarCambio({ u, activo: !u.activo })}
                    >
                      {u.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <NuevoUsuarioModal
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onCreado={(u) => {
          setUsuarios((prev) => (prev ? [...prev, u] : [u]))
          setModalAbierto(false)
          notificar({ tipo: 'exito', titulo: 'Usuario creado', descripcion: `${u.nombre} (${u.usuario})` })
        }}
      />

      <ConfirmDialog
        open={confirmarCambio !== null}
        title={confirmarCambio?.activo ? 'Activar usuario' : 'Desactivar usuario'}
        description={
          confirmarCambio
            ? `¿Confirmas ${confirmarCambio.activo ? 'activar' : 'desactivar'} la cuenta de ${confirmarCambio.u.nombre}?`
            : undefined
        }
        tono={confirmarCambio?.activo ? 'primary' : 'danger'}
        onConfirm={() => void confirmarActivarDesactivar()}
        onCancel={() => setConfirmarCambio(null)}
      />
    </div>
  )
}

function NuevoUsuarioModal({ abierto, onClose, onCreado }: { abierto: boolean; onClose: () => void; onCreado: (u: Usuario) => void }) {
  const { usuario, rolEfectivo } = useAuth()
  const { notificar } = useToast()
  const [claveUsuario, setClaveUsuario] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<Rol>('PERSONAL_MANTENIMIENTO')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [area, setArea] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  const limpiar = () => {
    setClaveUsuario('')
    setNombre('')
    setRol('PERSONAL_MANTENIMIENTO')
    setCorreo('')
    setTelefono('')
    setArea('')
    setErrores({})
  }

  const crear = async () => {
    if (!usuario) return
    const nuevos: Record<string, string> = {}
    if (!claveUsuario.trim()) nuevos.claveUsuario = 'Indica la clave de acceso.'
    if (!nombre.trim()) nuevos.nombre = 'Indica el nombre.'
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    setEnviando(true)
    const res = await usuariosService.crear({ usuario: claveUsuario, nombre, rol, correo, telefono, area }, rolEfectivo ?? undefined, usuario.nombre)
    setEnviando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo crear el usuario', descripcion: res.error.message })
      return
    }
    onCreado(res.data)
    limpiar()
  }

  return (
    <Modal open={abierto} onClose={onClose} title="Nuevo usuario">
      <div className="flex flex-col gap-4">
        <Input label="Clave de usuario" required value={claveUsuario} onChange={(e) => setClaveUsuario(e.target.value)} error={errores.claveUsuario} placeholder="Ej. 40001" />
        <Input label="Nombre completo" required value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} />
        <Select label="Rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROL_LABEL[r]}
            </option>
          ))}
        </Select>
        <Input label="Correo (opcional)" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <Input label="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <Input label="Área (opcional)" value={area} onChange={(e) => setArea(e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button loading={enviando} onClick={() => void crear()}>
          Crear usuario
        </Button>
      </div>
    </Modal>
  )
}
