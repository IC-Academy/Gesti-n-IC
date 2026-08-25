import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react'
import { classNames } from '../lib/format'

type ToastTipo = 'exito' | 'error' | 'info' | 'advertencia'

interface Toast {
  id: string
  tipo: ToastTipo
  titulo: string
  descripcion?: string
}

interface ToastContextValue {
  notificar: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const ICONOS: Record<ToastTipo, typeof CheckCircle2> = {
  exito: CheckCircle2,
  error: XCircle,
  info: Info,
  advertencia: TriangleAlert,
}

const ESTILOS: Record<ToastTipo, string> = {
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-ic-blue-100 bg-ic-blue-50 text-ic-blue-900',
  advertencia: 'border-amber-200 bg-amber-50 text-amber-900',
}

const ICONO_COLOR: Record<ToastTipo, string> = {
  exito: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-ic-blue-700',
  advertencia: 'text-amber-600',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notificar = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const cerrar = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ notificar }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((t) => {
          const Icono = ICONOS[t.tipo]
          return (
            <div
              key={t.id}
              role="status"
              className={classNames(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-ic-md backdrop-blur-sm',
                ESTILOS[t.tipo],
              )}
            >
              <Icono className={classNames('mt-0.5 h-5 w-5 shrink-0', ICONO_COLOR[t.tipo])} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{t.titulo}</p>
                {t.descripcion && <p className="mt-0.5 text-sm leading-snug opacity-90">{t.descripcion}</p>}
              </div>
              <button
                type="button"
                onClick={() => cerrar(t.id)}
                className="rounded-md p-0.5 opacity-60 transition hover:opacity-100 focus-ring"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
