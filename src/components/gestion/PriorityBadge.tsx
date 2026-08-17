import { Badge } from '@/components/Badge'
import { PRIORITY_COLORS } from '@/lib/catalog'
import type { Priority } from '@/lib/types'

export function PriorityBadge({ prioridad }: { prioridad: Priority }) {
  return <Badge label={prioridad} className={PRIORITY_COLORS[prioridad]} />
}
