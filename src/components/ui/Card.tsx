import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
  padding?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = true,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}>
      {(title || action) && (
        <div className={`flex items-start justify-between ${padding ? 'px-5 pt-5' : 'px-5 py-4'} ${!padding && 'border-b border-slate-100'}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>
        {children}
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value?: string | number | null
  className?: string
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, className = '' }) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className={`flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-slate-50 last:border-0 ${className}`}>
      <span className="text-sm font-medium text-slate-500 sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  )
}
