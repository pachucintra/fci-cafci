import React, { useState } from 'react'
import { User, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { getClient } from '../lib/supabase'
import { Modal } from './ui/Modal'

interface AccountModalProps {
  email: string
  onClose: () => void
}

export const AccountModal: React.FC<AccountModalProps> = ({ email, onClose }) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await getClient().auth.updateUser({ password: newPassword })
      if (err) throw err
      setSuccess('Contraseña actualizada correctamente.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Mi cuenta">
      <div className="space-y-6">

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Email
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-sm text-slate-700">{email}</span>
          </div>
        </div>

        {/* Change password */}
        <form onSubmit={handleChangePassword}>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Cambiar contraseña
          </label>

          {success && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                minLength={6}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Actualizar contraseña'
              }
            </button>
          </div>
        </form>

        {/* Supabase config (collapsed) */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowSupabaseConfig(v => !v)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600 transition-colors"
          >
            <span>Configuración avanzada (Supabase)</span>
            {showSupabaseConfig ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showSupabaseConfig && (
            <p className="mt-2 text-xs text-slate-500">
              Para cambiar el proyecto de Supabase, cerrá sesión y hacé clic en el ícono de ajustes en la pantalla de login.
            </p>
          )}
        </div>

      </div>
    </Modal>
  )
}
