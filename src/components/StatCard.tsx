import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  color?: 'teal' | 'emerald' | 'amber' | 'blue' | 'slate'
}

const colorClasses = {
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-100',
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'teal' }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
