import type { ComponentType } from 'react'
import { classNames } from '../../lib/format'

type Tono = 'azul' | 'amarillo' | 'verde' | 'rojo' | 'neutro'

const TONOS: Record<Tono, { icono: string; fondo: string }> = {
  azul: { icono: 'text-ic-blue-700 bg-ic-blue-50', fondo: '' },
  amarillo: { icono: 'text-ic-yellow-600 bg-ic-yellow-50', fondo: '' },
  verde: { icono: 'text-emerald-700 bg-emerald-50', fondo: '' },
  rojo: { icono: 'text-red-700 bg-red-50', fondo: '' },
  neutro: { icono: 'text-ic-slate bg-slate-100', fondo: '' },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tono = 'azul',
  hint,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  tono?: Tono
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-ic-line bg-white p-5 shadow-ic-sm transition hover:shadow-ic-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ic-slate">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ic-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-ic-slate">{hint}</p>}
        </div>
        <div className={classNames('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONOS[tono].icono)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
