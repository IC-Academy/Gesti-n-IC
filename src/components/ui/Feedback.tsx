import type { ReactNode } from 'react'
import { Loader2, Inbox, ShieldAlert } from 'lucide-react'
import { classNames } from '../../lib/format'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={classNames('h-5 w-5 animate-spin text-ic-blue-700', className)} aria-hidden="true" />
}

export function LoadingState({ label = 'Cargando información…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ic-slate">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ic-line bg-ic-blue-50/40 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ic-blue-700 shadow-ic-sm">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-ic-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ic-slate">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ title = 'Algo no salió bien', description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-ic-sm">
        <ShieldAlert className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ic-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ic-slate">{description}</p>}
      </div>
    </div>
  )
}
