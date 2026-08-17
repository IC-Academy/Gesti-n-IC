/** Barra de avance con semáforo: rojo si está bloqueado, ámbar si va lento, azul/verde si va bien. */
export function ProgressBar({ avance, bloqueado, size = 'md' }: { avance: number; bloqueado?: boolean; size?: 'sm' | 'md' }) {
  const color = bloqueado ? 'from-rose-600 to-rose-400' : avance >= 90 ? 'from-emerald-600 to-emerald-400' : avance >= 50 ? 'from-blue-600 to-sky-400' : 'from-amber-500 to-amber-300'
  return (
    <div className={`overflow-hidden rounded-full bg-slate-100 ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(100, Math.max(0, avance))}%` }} />
    </div>
  )
}
