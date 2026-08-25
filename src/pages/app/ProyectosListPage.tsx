import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { proyectosService } from '../../services/proyectosService'
import { usuariosService } from '../../services/usuariosService'
import type { Prioridad, Proyecto, Usuario } from '../../types'
import { PRIORIDAD_LABEL } from '../../types'
import { can } from '../../lib/permissions'
import { EstatusProyectoBadge, PrioridadBadge } from '../../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { useToast } from '../../context/ToastContext'
import { formatFecha } from '../../lib/format'

export function ProyectosListPage() {
  const { usuario, rolEfectivo } = useAuth()
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [responsables, setResponsables] = useState<Usuario[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const { notificar } = useToast()

  const cargar = () => {
    proyectosService.listar(rolEfectivo ?? undefined, usuario?.id).then((res) => {
      if (res.ok) setProyectos(res.data)
      else setError(res.error.message)
    })
  }

  useEffect(() => {
    cargar()
    usuariosService.listarSeleccionables(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) setResponsables(res.data.filter((u) => u.rol === 'JEFE_MANTENIMIENTO'))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolEfectivo, usuario?.id])

  const puedeCrear = can(rolEfectivo, 'proyectos.crear')

  if (error) return <ErrorState description={error} />
  if (!proyectos) return <LoadingState label="Cargando proyectos…" />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Proyectos</h1>
          <p className="mt-1 text-sm text-ic-slate">
            {can(rolEfectivo, 'proyectos.ver_todos') ? 'Todos los proyectos registrados.' : 'Proyectos asignados a tu equipo.'}
          </p>
        </div>
        {puedeCrear && (
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="h-4 w-4" /> Nuevo proyecto
          </Button>
        )}
      </div>

      {proyectos.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="Sin proyectos"
          description="Aún no hay proyectos registrados para tu perfil."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => (
            <Link
              key={p.id}
              to={`/app/proyectos/${p.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-ic-line bg-white p-5 shadow-ic-sm transition hover:-translate-y-0.5 hover:shadow-ic-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-ic-blue-700">{p.folio}</p>
                <EstatusProyectoBadge estatus={p.estatus} />
              </div>
              <h3 className="text-base font-semibold leading-snug text-ic-ink">{p.nombre}</h3>
              <p className="text-xs text-ic-slate">{p.ubicacion}</p>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-ic-slate">Avance</span>
                  <span className="font-semibold text-ic-blue-800">{p.avance}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-ic-blue-700" style={{ width: `${p.avance}%` }} />
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <PrioridadBadge prioridad={p.prioridad} />
                <span className="text-xs text-ic-slate">{formatFecha(p.fechaFinPlaneada)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {puedeCrear && (
        <NuevoProyectoModal
          abierto={modalAbierto}
          responsables={responsables}
          onClose={() => setModalAbierto(false)}
          onCreado={(p) => {
            setProyectos((prev) => (prev ? [p, ...prev] : [p]))
            notificar({ tipo: 'exito', titulo: 'Proyecto creado', descripcion: `${p.folio} — ${p.nombre}` })
            setModalAbierto(false)
          }}
        />
      )}
    </div>
  )
}

function NuevoProyectoModal({
  abierto,
  responsables,
  onClose,
  onCreado,
}: {
  abierto: boolean
  responsables: Usuario[]
  onClose: () => void
  onCreado: (p: Proyecto) => void
}) {
  const { usuario, rolEfectivo } = useAuth()
  const [nombre, setNombre] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA')
  const [responsableId, setResponsableId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFinPlaneada, setFechaFinPlaneada] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const { notificar } = useToast()

  const limpiar = () => {
    setNombre('')
    setPrioridad('MEDIA')
    setResponsableId('')
    setFechaInicio('')
    setFechaFinPlaneada('')
    setUbicacion('')
    setPresupuesto('')
    setDescripcion('')
    setErrores({})
  }

  const crear = async () => {
    if (!usuario) return
    const nuevos: Record<string, string> = {}
    if (!nombre.trim()) nuevos.nombre = 'Indica el nombre del proyecto.'
    if (!fechaInicio) nuevos.fechaInicio = 'Selecciona la fecha inicial.'
    if (!fechaFinPlaneada) nuevos.fechaFinPlaneada = 'Selecciona la fecha final estimada.'
    if (!ubicacion.trim()) nuevos.ubicacion = 'Indica la ubicación.'
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    setEnviando(true)
    const res = await proyectosService.crear(
      { nombre, prioridad, responsableId: responsableId || undefined, fechaInicio, fechaFinPlaneada, ubicacion, presupuestoEstimado: presupuesto ? Number(presupuesto) : undefined },
      rolEfectivo ?? undefined,
      usuario.id,
      usuario.nombre,
    )
    setEnviando(false)
    if (!res.ok) {
      notificar({ tipo: 'error', titulo: 'No se pudo crear el proyecto', descripcion: res.error.message })
      return
    }
    onCreado(res.data)
    limpiar()
  }

  return (
    <Modal open={abierto} onClose={onClose} title="Nuevo proyecto" description="Crea un proyecto directamente, sin partir de una solicitud." size="lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre del proyecto" required value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} className="sm:col-span-2" />
        <Textarea label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="sm:col-span-2" rows={3} />
        <Select label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
          {Object.entries(PRIORIDAD_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
        <Select label="Responsable" value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
          <option value="">Sin asignar todavía</option>
          {responsables.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </Select>
        <Input label="Fecha inicial" type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} error={errores.fechaInicio} />
        <Input label="Fecha final estimada" type="date" required value={fechaFinPlaneada} onChange={(e) => setFechaFinPlaneada(e.target.value)} error={errores.fechaFinPlaneada} />
        <Input label="Ubicación" required value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} error={errores.ubicacion} />
        <Input label="Presupuesto estimado (opcional)" type="number" min={0} value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button loading={enviando} onClick={() => void crear()}>
          Crear proyecto
        </Button>
      </div>
    </Modal>
  )
}
