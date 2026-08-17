import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const STYLES = {
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  error: { box: 'border-red-200 bg-red-50 text-red-700', Icon: XCircle },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-800', Icon: AlertTriangle },
  info: { box: 'border-blue-200 bg-blue-50 text-blue-800', Icon: Info },
} as const

export function Alert({ tone = 'info', title, children }: { tone?: keyof typeof STYLES; title?: string; children: ReactNode }) {
  const { box, Icon } = STYLES[tone]
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${box}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  )
}
