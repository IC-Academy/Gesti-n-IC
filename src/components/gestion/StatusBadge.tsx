import { Badge } from '@/components/Badge'
import { STATUS_COLORS } from '@/lib/catalog'
import type { ProjectStatus } from '@/lib/types'

export function StatusBadge({ estado }: { estado: ProjectStatus | string }) {
  return <Badge label={estado} className={STATUS_COLORS[estado] ?? 'bg-slate-100 text-slate-700 border-slate-300'} />
}
