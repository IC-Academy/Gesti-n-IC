import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, KeyRound, Send, ShieldCheck } from 'lucide-react'
import { useDemoStore } from '@/lib/demoStore'
import { useSession } from '@/lib/session'
import { ROLE_LABELS } from '@/lib/catalog'
import { areaPorId } from '@/lib/demoSelectors'
import { RecuperarAcceso } from './general/RecuperarAcceso'

export function Acceso() {
  const state = useDemoStore()
  const { entrarComo } = useSession()
  const [recuperar, setRecuperar] = useState(false)

  if (recuperar) return <RecuperarAcceso onVolver={() => setRecuperar(false)} />

  const personas = state.users.filter((u) => u.activo)

  return (
    <main className="gestion-login">
      <section className="gestion-hero">
        <div className="flex items-center gap-3">
          <span className="gestion-logo">IC</span>
          <b>Gestión IC Mantenimiento</b>
        </div>
        <div>
          <p className="gestion-kicker !text-blue-200">GESTIÓN CORPORATIVA · FY2026</p>
          <h1>
            Tus inmuebles operando,
            <br />
            sin perder el control.
          </h1>
          <p>
            Centraliza solicitudes de mantenimiento, intervenciones mayores, responsables, fechas y evidencia de inmuebles e instalaciones.
          </p>
        </div>
        <small>● Entorno de demostración · Datos simulados</small>
      </section>
      <section className="grid place-items-center overflow-y-auto bg-white p-10">
        <div className="w-full max-w-md">
          <p className="gestion-kicker">PORTAL DE MANTENIMIENTO DE INMUEBLES</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Bienvenido</h2>
          <p className="mt-2 text-sm text-slate-500">
            Este es un entorno de demostración: elige una persona para explorar la operación como técnico, coordinador o administrador.
          </p>
          <div className="mt-6 max-h-[46vh] space-y-2 overflow-y-auto pr-1">
            {personas.map((p) => {
              const area = areaPorId(state, p.areaId)
              return (
                <button key={p.id} onClick={() => entrarComo(p.id)} className="gestion-role">
                  <span>{p.avatarIniciales}</span>
                  <div>
                    <b>{p.nombre}</b>
                    <small>
                      {ROLE_LABELS[p.rol]} · {area?.nombre ?? 'Sin área'}
                    </small>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
            <span>
              <b>Acceso corporativo</b>
              <br />
              La versión productiva utilizará el proveedor de identidad corporativo (p. ej. Microsoft Entra ID); este
              selector de persona solo existe en modo demostración.
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button onClick={() => setRecuperar(true)} className="flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline">
              <KeyRound className="h-3.5 w-3.5" /> ¿Problemas para entrar? Recuperar acceso
            </button>
            <Link to="/publico/nueva-solicitud" className="flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline">
              <Send className="h-3.5 w-3.5" /> Reportar una necesidad de mantenimiento
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
