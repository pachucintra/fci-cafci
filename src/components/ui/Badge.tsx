import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'teal'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  teal: 'bg-teal-100 text-teal-700',
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const getPainBadgeVariant = (pain: number): BadgeVariant => {
  if (pain <= 3) return 'success'
  if (pain <= 6) return 'warning'
  return 'danger'
}
