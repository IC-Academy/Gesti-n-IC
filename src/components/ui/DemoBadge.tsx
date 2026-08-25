import { FlaskConical } from 'lucide-react'
import { IS_DEMO } from '../../services/config'

export function DemoBadge() {
  if (!IS_DEMO) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-ic-yellow-500/60 bg-ic-yellow-50 px-2.5 py-1 text-xs font-semibold text-ic-yellow-600"
      title="Los datos de este portal son de demostración y viven solo en tu navegador."
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      Ambiente demo
    </span>
  )
}
