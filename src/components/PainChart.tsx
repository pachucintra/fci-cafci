import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Session } from '../types'

interface PainChartProps {
  sessions: Session[]
}

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y?.slice(2)}`
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number }[]; label?: string }> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const pain = payload[0].value
    const color = pain <= 3 ? '#10b981' : pain <= 6 ? '#f59e0b' : '#ef4444'
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-bold" style={{ color }}>
          EVA: {pain}/10
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {pain <= 3 ? 'Dolor leve' : pain <= 6 ? 'Dolor moderado' : 'Dolor intenso'}
        </p>
      </div>
    )
  }
  return null
}

const CustomDot: React.FC<{
  cx?: number
  cy?: number
  payload?: { dolor: number }
}> = ({ cx, cy, payload }) => {
  if (!cx || !cy || !payload) return null
  const pain = payload.dolor
  const color = pain <= 3 ? '#10b981' : pain <= 6 ? '#f59e0b' : '#ef4444'
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  )
}

export const PainChart: React.FC<PainChartProps> = ({ sessions }) => {
  const data = sessions.map(s => ({
    fecha: formatDate(s.fecha),
    dolor: s.dolor,
  }))

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-sm">Sin sesiones registradas</p>
        <p className="text-xs mt-1">Agrega sesiones para ver la evolución del dolor</p>
      </div>
    )
  }

  if (data.length === 1) {
    const d = data[0]
    const color = d.dolor <= 3 ? '#10b981' : d.dolor <= 6 ? '#f59e0b' : '#ef4444'
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <p className="text-sm mb-2">Solo hay una sesión registrada</p>
        <p className="text-3xl font-bold" style={{ color }}>{d.dolor}/10</p>
        <p className="text-xs text-slate-400 mt-1">{d.fecha}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} />
          <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="dolor"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: '#0d9488', stroke: 'white', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-0.5 bg-emerald-500 block rounded" />
          Leve (≤3)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-0.5 bg-amber-500 block rounded" />
          Moderado (4-6)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-0.5 bg-red-500 block rounded" />
          Intenso (≥7)
        </span>
      </div>
    </div>
  )
}
