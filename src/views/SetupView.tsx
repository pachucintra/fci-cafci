import React, { useState } from 'react'
import { Activity, Database, Shield, Zap, ExternalLink, ChevronRight, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { saveConfig } from '../lib/supabase'

interface SetupViewProps {
  onComplete: () => void
}

export const SetupView: React.FC<SetupViewProps> = ({ onComplete }) => {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ url?: string; key?: string }>({})

  const validate = () => {
    const errs: { url?: string; key?: string } = {}
    if (!url.trim()) errs.url = 'La URL es requerida'
    else if (!url.startsWith('https://')) errs.url = 'Debe comenzar con https://'
    if (!key.trim()) errs.key = 'La clave anon es requerida'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      saveConfig(url.trim(), key.trim())
      setTimeout(() => {
        setSaving(false)
        onComplete()
      }, 500)
    } catch {
      setSaving(false)
    }
  }

  const steps = [
    {
      number: '1',
      title: 'Crear proyecto en Supabase',
      description: (
        <>
          Ve a{' '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 hover:underline inline-flex items-center gap-0.5"
          >
            supabase.com <ExternalLink className="h-3 w-3" />
          </a>{' '}
          y crea un nuevo proyecto gratuito.
        </>
      ),
    },
    {
      number: '2',
      title: 'Ejecutar el schema SQL',
      description: (
        <>
          En el SQL Editor de Supabase, ejecuta el archivo{' '}
          <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded text-xs font-mono">
            supabase/schema.sql
          </code>{' '}
          que está en este repositorio.
        </>
      ),
    },
    {
      number: '3',
      title: 'Obtener las credenciales',
      description: (
        <>
          En{' '}
          <span className="font-medium text-slate-700">
            Project Settings → API
          </span>
          , copia la{' '}
          <span className="font-medium text-slate-700">Project URL</span> y la{' '}
          <span className="font-medium text-slate-700">anon/public key</span>.
        </>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <Activity className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">KinesioApp</h1>
          <p className="text-slate-500 mt-2">Sistema de gestión para kinesiología</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Feature highlights */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5">
            <h2 className="text-white font-semibold text-lg mb-3">Bienvenido/a a KinesioApp</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Database className="h-4 w-4" />, label: 'Tu base de datos' },
                { icon: <Shield className="h-4 w-4" />, label: 'Datos seguros' },
                { icon: <Zap className="h-4 w-4" />, label: 'Sin límites' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-teal-100">
                  {f.icon}
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Steps */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                Configuración inicial
              </h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-slate-800">{step.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  Ingresar credenciales
                </h3>
                <div className="space-y-3">
                  <Input
                    label="Project URL"
                    type="url"
                    placeholder="https://xxxxxxxxxxxx.supabase.co"
                    value={url}
                    onChange={e => {
                      setUrl(e.target.value)
                      if (errors.url) setErrors(p => ({ ...p, url: undefined }))
                    }}
                    error={errors.url}
                  />
                  <Input
                    label="Anon/Public Key"
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={key}
                    onChange={e => {
                      setKey(e.target.value)
                      if (errors.key) setErrors(p => ({ ...p, key: undefined }))
                    }}
                    error={errors.key}
                    hint="La clave pública anon de tu proyecto Supabase"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
                <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Las credenciales se guardan localmente en tu navegador. 
                  Esta es una app de un solo usuario — conecta tu propio proyecto Supabase.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={saving}>
                {saving ? 'Conectando...' : (
                  <>
                    Conectar y comenzar
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer note */}
            <div className="mt-4 flex items-center gap-2 justify-center text-xs text-slate-400">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>Supabase ofrece un plan gratuito con 500MB de almacenamiento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
