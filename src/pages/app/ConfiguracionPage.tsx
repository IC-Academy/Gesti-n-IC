import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { configuracionService } from '../../services/configuracionService'
import type { Configuracion } from '../../types'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'

export function ConfiguracionPage() {
  const { rolEfectivo } = useAuth()
  const [items, setItems] = useState<Configuracion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState<string | null>(null)
  const { notificar } = useToast()

  useEffect(() => {
    configuracionService.listar(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) {
        setItems(res.data)
        setValores(Object.fromEntries(res.data.map((c) => [c.clave, c.valor])))
      } else setError(res.error.message)
    })
  }, [rolEfectivo])

  const guardar = async (clave: string) => {
    setGuardando(clave)
    const res = await configuracionService.actualizar(clave, valores[clave] ?? '', rolEfectivo ?? undefined)
    setGuardando(null)
    if (res.ok) notificar({ tipo: 'exito', titulo: 'Configuración actualizada' })
    else notificar({ tipo: 'error', titulo: 'No se pudo guardar', descripcion: res.error.message })
import { useEffect, useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { configuracionService } from '../../services/configuracionService'
import type { Configuracion } from '../../types'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { LoadingState, ErrorState } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'
import { resetDb } from '../../services/demo/db'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export function ConfiguracionPage() {
  const { rolEfectivo } = useAuth()
  const [items, setItems] = useState<Configuracion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState<string | null>(null)
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)
  const { notificar } = useToast()

  useEffect(() => {
    configuracionService.listar(rolEfectivo ?? undefined).then((res) => {
      if (res.ok) {
        setItems(res.data)
        setValores(Object.fromEntries(res.data.map((c) => [c.clave, c.valor])))
      } else setError(res.error.message)
    })
  }, [rolEfectivo])

  const guardar = async (clave: string) => {
    setGuardando(clave)
    const res = await configuracionService.actualizar(clave, valores[clave] ?? '', rolEfectivo ?? undefined)
    setGuardando(null)
    if (res.ok) notificar({ tipo: 'exito', titulo: 'Configuración actualizada' })
    else notificar({ tipo: 'error', titulo: 'No se pudo guardar', descripcion: res.error.message })
  }

  if (error) return <ErrorState description={error} />
  if (!items) return <LoadingState label="Cargando configuración…" />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Configuración</h1>
        <p className="mt-1 text-sm text-ic-slate">Parámetros generales del portal (modo demo).</p>
      </div>

      <Card>
        <CardHeader title="Parámetros del sistema" />
        <CardBody className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.clave} className="flex flex-col gap-2 border-b border-ic-line pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-end sm:justify-between">
              <Input
                label={item.clave}
                hint={item.descripcion}
                value={valores[item.clave] ?? ''}
                onChange={(e) => setValores((prev) => ({ ...prev, [item.clave]: e.target.value }))}
                className="sm:w-96"
              />
              <Button size="sm" variant="outline" loading={guardando === item.clave} onClick={() => void guardar(item.clave)}>
                <Save className="h-4 w-4" /> Guardar
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Escenario de demostración" description="Recupera solicitudes, proyectos, actividades y evidencias de ejemplo para repetir la presentación completa." />
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm text-ic-slate">El reinicio reemplaza únicamente los datos guardados por esta demo en este navegador.</p>
          <Button variant="outline" onClick={() => setConfirmarReinicio(true)}>
            <RotateCcw className="h-4 w-4" /> Restablecer datos demo
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmarReinicio}
        title="Restablecer escenario demo"
        description="Se descartarán los cambios locales de esta demostración y se recuperará el escenario inicial."
        confirmLabel="Restablecer demo"
        tono="danger"
        onConfirm={() => {
          resetDb()
          setConfirmarReinicio(false)
          notificar({ tipo: 'exito', titulo: 'Datos demo restablecidos' })
          window.location.reload()
        }}
        onCancel={() => setConfirmarReinicio(false)}
      />
    </div>
  )
}
  }

  if (error) return <ErrorState description={error} />
  if (!items) return <LoadingState label="Cargando configuración…" />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ic-ink">Configuración</h1>
        <p className="mt-1 text-sm text-ic-slate">Parámetros generales del portal (modo demo).</p>
      </div>

      <Card>
        <CardHeader title="Parámetros del sistema" />
        <CardBody className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.clave} className="flex flex-col gap-2 border-b border-ic-line pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-end sm:justify-between">
              <Input
                label={item.clave}
                hint={item.descripcion}
                value={valores[item.clave] ?? ''}
                onChange={(e) => setValores((prev) => ({ ...prev, [item.clave]: e.target.value }))}
                className="sm:w-96"
              />
              <Button size="sm" variant="outline" loading={guardando === item.clave} onClick={() => void guardar(item.clave)}>
                <Save className="h-4 w-4" /> Guardar
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
