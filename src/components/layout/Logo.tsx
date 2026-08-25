import { Building2 } from 'lucide-react'
import { classNames } from '../../lib/format'

export function Logo({ compact, dark }: { compact?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={classNames(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          dark ? 'bg-white text-ic-blue-900' : 'bg-ic-blue-900 text-white',
        )}
      >
        <Building2 className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className={classNames('leading-tight', dark ? 'text-white' : 'text-ic-ink')}>
          <span className="block text-sm font-semibold tracking-tight">Gestión IC</span>
          <span className={classNames('block text-[11px]', dark ? 'text-white/70' : 'text-ic-slate')}>
            Inmuebles e Instalaciones
          </span>
        </span>
      )}
    </div>
  )
}
