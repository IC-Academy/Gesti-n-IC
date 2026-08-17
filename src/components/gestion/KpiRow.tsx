import type { LucideIcon } from 'lucide-react'

export interface KpiItem {
  icon: LucideIcon
  value: string | number
  label: string
  hint?: string
  tone?: 0 | 1 | 2 | 3
}

/** Fila de tarjetas ejecutivas (KPIs). Reutiliza las clases .gestion-kpis del sistema visual existente. */
export function KpiRow({ items }: { items: KpiItem[] }) {
  return (
    <div className="gestion-kpis">
      {items.map((it) => (
        <article key={it.label}>
          <span className={`gestion-icon gi${it.tone ?? 0}`}>
            <it.icon className="h-5 w-5" />
          </span>
          <div>
            <small>{it.label}</small>
            <b>{it.value}</b>
            {it.hint ? <p>{it.hint}</p> : null}
          </div>
        </article>
      ))}
    </div>
  )
}
