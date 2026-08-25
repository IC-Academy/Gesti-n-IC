import { useMemo } from 'react'
import { differenceInCalendarDays, addDays, format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Actividad } from '../../types'
import { EstatusActividadBadge } from '../ui/Badge'
import { EmptyState } from '../ui/Feedback'
import { CalendarRange } from 'lucide-react'

const COLOR_BARRA: Record<Actividad['estatus'], string> = {
  PENDIENTE: 'bg-slate-300',
  EN_PROCESO: 'bg-ic-yellow-500',
  BLOQUEADA: 'bg-red-400',
  EN_VALIDACION: 'bg-ic-blue-400',
  COMPLETADA: 'bg-emerald-500',
  CANCELADA: 'bg-slate-200',
}

const DIA_PX = 34

export function GanttChart({ actividades }: { actividades: Actividad[] }) {
  const datos = useMemo(() => {
    const conFechas = actividades.filter((a) => a.fechaInicio && a.fechaFin)
    if (conFechas.length === 0) return null

    const fechas = conFechas.flatMap((a) => [new Date(a.fechaInicio!), new Date(a.fechaFin!)]).filter(isValid)
    const inicioGlobal = new Date(Math.min(...fechas.map((f) => f.getTime())))
    const finGlobal = new Date(Math.max(...fechas.map((f) => f.getTime())))
    const totalDias = Math.max(differenceInCalendarDays(finGlobal, inicioGlobal) + 1, 1)

    const dias = Array.from({ length: totalDias }, (_, i) => addDays(inicioGlobal, i))

    const filas = conFechas.map((a) => {
      const inicio = new Date(a.fechaInicio!)
      const fin = new Date(a.fechaFin!)
      const offset = Math.max(differenceInCalendarDays(inicio, inicioGlobal), 0)
      const duracion = Math.max(differenceInCalendarDays(fin, inicio) + 1, 1)
      return { actividad: a, offset, duracion }
    })

    return { dias, filas, inicioGlobal }
  }, [actividades])

  if (!datos) {
    return (
      <EmptyState
        icon={<CalendarRange className="h-6 w-6" />}
        title="Sin fechas para graficar"
        description="Asigna fecha de inicio y fin a las actividades para ver el Gantt del proyecto."
      />
    )
  }

  const { dias, filas } = datos
  const anchoTotal = dias.length * DIA_PX
  const hoy = new Date()

  return (
    <div className="overflow-x-auto rounded-xl border border-ic-line">
      <div style={{ minWidth: 220 + anchoTotal }}>
        {/* Encabezado de fechas */}
        <div className="flex border-b border-ic-line bg-ic-blue-50/50">
          <div className="w-[220px] shrink-0 border-r border-ic-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ic-slate">
            Actividad
          </div>
          <div className="flex">
            {dias.map((d, i) => (
              <div
                key={i}
                style={{ width: DIA_PX }}
                className="shrink-0 border-r border-ic-line/60 py-2 text-center text-[11px] font-medium text-ic-slate last:border-r-0"
              >
                <div>{format(d, 'd', { locale: es })}</div>
                <div className="text-[9px] uppercase text-ic-slate/70">{format(d, 'EEE', { locale: es })}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filas */}
        {filas.map(({ actividad, offset, duracion }) => (
          <div key={actividad.id} className="flex border-b border-ic-line/70 last:border-b-0">
            <div className="flex w-[220px] shrink-0 flex-col justify-center gap-1 border-r border-ic-line px-3 py-2.5">
              <p className="truncate text-sm font-medium text-ic-ink" title={actividad.nombre}>
                {actividad.nombre}
              </p>
              <div className="flex items-center gap-1.5">
                <EstatusActividadBadge estatus={actividad.estatus} />
              </div>
            </div>
            <div className="relative py-2.5" style={{ width: anchoTotal }}>
              <div
                className="absolute top-1/2 h-6 -translate-y-1/2 overflow-hidden rounded-md bg-slate-200/70 shadow-sm ring-1 ring-inset ring-black/5"
                style={{ left: offset * DIA_PX + 3, width: duracion * DIA_PX - 6 }}
                title={`${actividad.nombre} · ${actividad.avance}% de avance`}
              >
                <div className={`h-full ${COLOR_BARRA[actividad.estatus]}`} style={{ width: `${actividad.avance}%` }} />
              </div>
              {dias.map((d, i) =>
                d.toDateString() === hoy.toDateString() ? (
                  <div key={i} className="absolute top-0 bottom-0 w-px bg-ic-blue-700/70" style={{ left: i * DIA_PX + DIA_PX / 2 }} />
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
