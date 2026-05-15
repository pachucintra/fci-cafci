import React, { useState } from 'react'
import { Activity, Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface AuthViewProps {
  onAuthenticated: () => void
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        onAuthenticated()
      } else {
        await signUp(email, password)
        setSuccess('¡Cuenta creada! Revisá tu email para confirmar y luego iniciá sesión.')
        setMode('login')
        setPassword('')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      if (msg.includes('Invalid login credentials')) setError('Email o contraseña incorrectos.')
      else if (msg.includes('already registered')) setError('Este email ya tiene una cuenta. Iniciá sesión.')
      else if (msg.includes('Password should be')) setError('La contraseña debe tener al menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">KinesioApp</h1>
          <p className="text-sm text-slate-500 mt-1">Sistema de gestión para kinesiología</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Registrarse
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> Iniciar sesión</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Crear cuenta</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Cada kinesiólogo tiene su propia cuenta y sus pacientes son privados.
        </p>
      </div>
    </div>
  )
}
