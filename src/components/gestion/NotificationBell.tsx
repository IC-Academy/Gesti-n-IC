import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useDemoStore, marcarNotificacionLeida, marcarTodasLeidas } from '@/lib/demoStore'
import { notificacionesDeUsuario } from '@/lib/demoSelectors'
import { useSession } from '@/lib/session'

const TONO: Record<string, string> = {
  info: 'bg-blue-50 text-blue-600',
  alerta: 'bg-amber-50 text-amber-600',
  exito: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-600',
}

export function NotificationBell() {
  const { user } = useSession()
  const state = useDemoStore()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  if (!user) return null

  const notifs = notificacionesDeUsuario(state, user.id)
  const noLeidas = notifs.filter((n) => !n.leida).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {noLeidas > 0 ? <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{noLeidas}</span> : null}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <b className="text-sm">Notificaciones</b>
              {noLeidas > 0 ? (
                <button onClick={() => marcarTodasLeidas(user.id)} className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                  <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifs.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-slate-400">No tienes notificaciones.</p>
              ) : (
                notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      marcarNotificacionLeida(n.id)
                      if (n.enlace) nav(n.enlace)
                      setOpen(false)
                    }}
                    className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left text-xs last:border-0 hover:bg-slate-50 ${n.leida ? 'opacity-60' : ''}`}
                  >
                    <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${TONO[n.tipo]}`}>●</span>
                    <span>
                      <b className="block text-slate-800">{n.titulo}</b>
                      <span className="mt-0.5 block text-slate-500">{n.mensaje}</span>
                      <span className="mt-1 block text-[10px] text-slate-400">{new Date(n.creadaEn).toLocaleString('es-MX')}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
