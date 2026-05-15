import React from 'react'
import { Activity, ChevronLeft, Settings } from 'lucide-react'

interface HeaderProps {
  onLogoClick: () => void
  onSettingsClick?: () => void
  title?: string
  backLabel?: string
  onBack?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onLogoClick,
  onSettingsClick,
  title,
  backLabel,
  onBack,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 text-teal-600 hover:text-teal-700 transition-colors"
        >
          <div className="p-1.5 bg-teal-600 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-base hidden sm:block">KinesioApp</span>
        </button>

        {onBack && backLabel && (
          <>
            <span className="text-slate-300">/</span>
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              {backLabel}
            </button>
          </>
        )}

        {title && (
          <>
            {!onBack && <span className="text-slate-300">/</span>}
            <span className="text-sm font-medium text-slate-700 truncate">{title}</span>
          </>
        )}

        <div className="ml-auto">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Configuración"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
