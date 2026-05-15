import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { Toast as ToastType } from '../../hooks/useToast'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
}

const bgClasses = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onRemove }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full ${bgClasses[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-slate-800">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
