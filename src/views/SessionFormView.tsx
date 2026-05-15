import React, { useState } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import { Patient, Session, SessionFormData, PainPoint } from '../types'
import { useSessions } from '../hooks/useSessions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card } from '../components/ui/Card'
import { BodyMap } from '../components/BodyMap'
import { Toast } from '../hooks/useToast'

interface SessionFormViewProps {
  patient: Patient
  session?: Session | null
  onBack: () => void
  onSaved: () => void
  addToast: (message: string, type?: Toast['type']) => void
}

const today = () => new Date().toISOString().split('T')[0]

const emptyForm = (patientId: string): SessionFormData => ({
  patient_id: patientId,
  fecha: today(),
  dolor: 5,
  evaluacion: '',
  tratamiento: '',
  ejercicios: '',
  observaciones: '',
  puntos: [],
})

const fromSession = (s: Session): SessionFormData => ({
  patient_id: s.patient_id,
  fecha: s.fecha,
  dolor: s.dolor,
  evaluacion: s.evaluacion || '',
  tratamiento: s.tratamiento || '',
  ejercicios: s.ejercicios || '',
  observaciones: s.observaciones || '',
  puntos: s.puntos || [],
})

const painColor = (val: number): string => {
  if (val <= 3) return '#10b981'
  if (val <= 6) return '#f59e0b'
  return '#ef4444'
}

const painLabel = (val: number): string => {
  if (val === 0) return 'Sin dolor'
  if (val <= 3) return 'Dolor leve'
  if (val <= 6) return 'Dolor moderado'
  if (val <= 8) return 'Dolor intenso'
  return 'Dolor insoportable'
}

export const SessionFormView: React.FC<SessionFormViewProps> = ({
  patient,
  session,
  onBack,
  onSaved,
  addToast,
}) => {
  const isEdit = !!session
  const [form, setForm] = useState<SessionFormData>(
    session ? fromSession(session) : emptyForm(patient.id)
  )
  const [saving, setSaving] = useState(false)
  const { createSession, updateSession } = useSessions(patient.id)

  const set = (field: keyof SessionFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const setDolor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, dolor: parseInt(e.target.value) }))
  }

  const setPuntos = (puntos: PainPoint[]) => {
    setForm(prev => ({ ...prev, puntos }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fecha) {
      addToast('La fecha es requerida', 'warning')
      return
    }
    setSaving(true)
    try {
      if (isEdit && session) {
        await updateSession(session.id, form)
        addToast('Sesión actualizada correctamente', 'success')
      } else {
        await createSession(form)
        addToast('Sesión registrada correctamente', 'success')
      }
      onSaved()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const color = painColor(form.dolor)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />}>
          Volver
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Editar sesión' : 'Nueva sesión'}
          </h1>
          <p className="text-sm text-slate-500">
            Paciente: {patient.nombre} {patient.apellido}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <Card title="Datos de la sesión">
          <div className="pt-2">
            <Input
              label="Fecha de la sesión"
              type="date"
              value={form.fecha}
              onChange={set('fecha')}
              className="max-w-xs"
            />
          </div>
        </Card>

        {/* Pain scale */}
        <Card title="Escala de Dolor (EVA)" subtitle="Escala visual analógica 0-10">
          <div className="pt-3 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-4xl font-bold tabular-nums transition-colors"
                style={{ color }}
              >
                {form.dolor}
              </span>
              <div className="text-right">
                <span
                  className="text-sm font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    color,
                    backgroundColor: `${color}1a`,
                  }}
                >
                  {painLabel(form.dolor)}
                </span>
              </div>
            </div>

            <div className="relative py-2">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={form.dolor}
                onChange={setDolor}
                className="w-full"
                style={{
                  accentColor: color,
                }}
              />
              <div className="flex justify-between mt-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, dolor: n }))}
                    className={`text-xs w-6 h-6 rounded-full flex items-center justify-center transition-all
                      ${form.dolor === n
                        ? 'font-bold text-white'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    style={form.dolor === n ? { backgroundColor: color } : {}}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale legend */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="text-emerald-600 font-medium">Sin dolor (0)</span>
              <span className="text-amber-600 font-medium">Moderado (5)</span>
              <span className="text-red-600 font-medium">Insoportable (10)</span>
            </div>
          </div>
        </Card>

        {/* Body map */}
        <Card title="Mapa Corporal de Dolor" subtitle="Marcá las zonas de dolor en el cuerpo">
          <div className="pt-3">
            <BodyMap points={form.puntos} onChange={setPuntos} />
          </div>
        </Card>

        {/* Clinical notes */}
        <Card title="Notas Clínicas">
          <div className="pt-2 space-y-4">
            <Textarea
              label="Evaluación"
              placeholder="Observaciones de la evaluación física, ROM, fuerza, postura..."
              value={form.evaluacion}
              onChange={set('evaluacion')}
              rows={4}
            />
            <Textarea
              label="Tratamiento"
              placeholder="Técnicas aplicadas: masoterapia, electroterapia, movilizaciones..."
              value={form.tratamiento}
              onChange={set('tratamiento')}
              rows={4}
            />
            <Textarea
              label="Ejercicios"
              placeholder="Ejercicios indicados, series, repeticiones, progresión..."
              value={form.ejercicios}
              onChange={set('ejercicios')}
              rows={4}
            />
            <Textarea
              label="Observaciones"
              placeholder="Notas adicionales, tolerancia al tratamiento, próximos objetivos..."
              value={form.observaciones}
              onChange={set('observaciones')}
              rows={3}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <Button type="button" variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar sesión'}
          </Button>
        </div>
      </form>
    </div>
  )
}
