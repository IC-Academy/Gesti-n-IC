import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CargaResponsable, TendenciaMensual } from '../../services/dashboardService'
import type { Prioridad } from '../../types'
import { PRIORIDAD_LABEL } from '../../types'

const AZUL = '#002a5c'
const AMARILLO = '#fec52a'
const AZUL_CLARO = '#5c86b3'
const GRIS = '#c9d3e0'

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #e3e9f1',
  boxShadow: '0 4px 16px -4px rgba(16,35,61,0.12)',
  fontSize: 13,
}

export function TendenciaSolicitudesChart({ data }: { data: TendenciaMensual[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="tendenciaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AZUL} stopOpacity={0.28} />
            <stop offset="100%" stopColor={AZUL} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e3e9f1" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#4b5d76' }} axisLine={{ stroke: '#e3e9f1' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5d76' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(mes) => `Mes: ${mes}`} />
        <Area type="monotone" dataKey="solicitudes" stroke={AZUL} strokeWidth={2} fill="url(#tendenciaFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  BAJA: GRIS,
  MEDIA: AZUL_CLARO,
  ALTA: AMARILLO,
  CRITICA: '#dc2626',
}

export function DistribucionPrioridadChart({ data }: { data: Record<Prioridad, number> }) {
  const items = (Object.keys(data) as Prioridad[])
    .map((p) => ({ name: PRIORIDAD_LABEL[p], value: data[p], prioridad: p }))
    .filter((i) => i.value > 0)

  if (items.length === 0) {
    return <p className="py-16 text-center text-sm text-ic-slate">Sin proyectos registrados aún.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={items} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {items.map((item) => (
            <Cell key={item.prioridad} fill={COLOR_PRIORIDAD[item.prioridad]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#4b5d76' }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function CargaResponsableChart({ data }: { data: CargaResponsable[] }) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ic-slate">Aún no hay actividades asignadas.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 46)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barCategoryGap={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e3e9f1" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5d76' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nombre"
          width={130}
          tick={{ fontSize: 12, fill: '#10233d' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#4b5d76' }} />
        <Bar dataKey="actividadesActivas" name="Activas" fill={AMARILLO} radius={[0, 6, 6, 0]} barSize={16} />
        <Bar dataKey="actividadesCompletadas" name="Completadas" fill={AZUL} radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}
