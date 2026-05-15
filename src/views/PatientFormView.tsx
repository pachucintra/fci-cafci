import React, { useState } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import { Patient, PatientFormData } from '../types'
import { usePatients } from '../hooks/usePatients'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Toast } from '../hooks/useToast'

interface PatientFormViewProps {
  patient?: Patient | null
  onBack: () => void
  onSaved: (patient: Patient) => void
  addToast: (message: string, type?: Toast['type']) => void
}

const SEXO_OPTIONS = [
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Otro', label: 'Otro' },
  { value: 'Prefiero no decir', label: 'Prefiero no decir' },
]

const ESTADO_CIVIL_OPTIONS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'Soltero/a', label: 'Soltero/a' },
  { value: 'Casado/a', label: 'Casado/a' },
  { value: 'Pareja de hecho', label: 'Pareja de hecho' },
  { value: 'Divorciado/a', label: 'Divorciado/a' },
  { value: 'Viudo/a', label: 'Viudo/a' },
]

const emptyForm = (): PatientFormData => ({
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  sexo: 'Femenino',
  telefono: '',
  domicilio: '',
  ocupacion: '',
  estado_civil: '',
  peso: undefined,
  talla: undefined,
  ta: '',
  fcfr: '',
  diagnostico: '',
  motivo: '',
  tratamientos_prev: '',
  antecedentes: '',
  habitos: '',
})

const fromPatient = (p: Patient): PatientFormData => ({
  nombre: p.nombre,
  apellido: p.apellido,
  dni: p.dni || '',
  fecha_nacimiento: p.fecha_nacimiento || '',
  sexo: p.sexo || 'Femenino',
  telefono: p.telefono || '',
  domicilio: p.domicilio || '',
  ocupacion: p.ocupacion || '',
  estado_civil: p.estado_civil || '',
  peso: p.peso,
  talla: p.talla,
  ta: p.ta || '',
  fcfr: p.fcfr || '',
  diagnostico: p.diagnostico || '',
  motivo: p.motivo || '',
  tratamientos_prev: p.tratamientos_prev || '',
  antecedentes: p.antecedentes || '',
  habitos: p.habitos || '',
})

export const PatientFormView: React.FC<PatientFormViewProps> = ({
  patient,
  onBack,
  onSaved,
  addToast,
}) => {
  const isEdit = !!patient
  const [form, setForm] = useState<PatientFormData>(patient ? fromPatient(patient) : emptyForm())
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})
  const [saving, setSaving] = useState(false)
  const { createPatient, updatePatient } = usePatients()

  const set = (field: keyof PatientFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val = e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const setNum = (field: 'peso' | 'talla') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PatientFormData, string>> = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
    if (!form.apellido.trim()) errs.apellido = 'El apellido es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      // Clean form: remove empty strings for optional fields
      const clean = { ...form }
      if (!clean.dni) delete clean.dni
      if (!clean.fecha_nacimiento) delete clean.fecha_nacimiento
      if (!clean.telefono) delete clean.telefono
      if (!clean.domicilio) delete clean.domicilio
      if (!clean.ocupacion) delete clean.ocupacion
      if (!clean.estado_civil) delete clean.estado_civil
      if (!clean.ta) delete clean.ta
      if (!clean.fcfr) delete clean.fcfr
      if (!clean.diagnostico) delete clean.diagnostico
      if (!clean.motivo) delete clean.motivo
      if (!clean.tratamientos_prev) delete clean.tratamientos_prev
      if (!clean.antecedentes) delete clean.antecedentes
      if (!clean.habitos) delete clean.habitos

      if (isEdit && patient) {
        await updatePatient(patient.id, clean)
        addToast('Paciente actualizado correctamente', 'success')
        onSaved({ ...patient, ...clean })
      } else {
        const created = await createPatient(clean)
        if (created) {
          addToast('Paciente creado correctamente', 'success')
          onSaved(created)
        }
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />}>
          Volver
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? `Editar: ${patient.nombre} ${patient.apellido}` : 'Nuevo Paciente'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Modificá los datos del paciente' : 'Completá los datos del paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Datos Personales */}
        <Card title="Datos Personales" subtitle="Información básica del paciente">
          <div className="pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                placeholder="Ej: María"
                value={form.nombre}
                onChange={set('nombre')}
                error={errors.nombre}
              />
              <Input
                label="Apellido *"
                placeholder="Ej: González"
                value={form.apellido}
                onChange={set('apellido')}
                error={errors.apellido}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="DNI"
                placeholder="Ej: 30.123.456"
                value={form.dni || ''}
                onChange={set('dni')}
              />
              <Input
                label="Fecha de nacimiento"
                type="date"
                value={form.fecha_nacimiento || ''}
                onChange={set('fecha_nacimiento')}
              />
              <Select
                label="Sexo"
                options={SEXO_OPTIONS}
                value={form.sexo}
                onChange={set('sexo')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                placeholder="Ej: 11-1234-5678"
                value={form.telefono || ''}
                onChange={set('telefono')}
              />
              <Input
                label="Domicilio"
                placeholder="Ej: Av. Corrientes 1234"
                value={form.domicilio || ''}
                onChange={set('domicilio')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ocupación"
                placeholder="Ej: Administrativo"
                value={form.ocupacion || ''}
                onChange={set('ocupacion')}
              />
              <Select
                label="Estado civil"
                options={ESTADO_CIVIL_OPTIONS}
                value={form.estado_civil || ''}
                onChange={set('estado_civil')}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Exploración Física */}
        <Card title="Exploración Física" subtitle="Datos de la primera consulta">
          <div className="pt-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Peso (kg)"
                type="number"
                placeholder="70"
                min={0}
                max={300}
                step={0.1}
                value={form.peso !== undefined ? form.peso : ''}
                onChange={setNum('peso')}
              />
              <Input
                label="Talla (cm)"
                type="number"
                placeholder="170"
                min={0}
                max={250}
                step={0.1}
                value={form.talla !== undefined ? form.talla : ''}
                onChange={setNum('talla')}
              />
              <Input
                label="T/A (mmHg)"
                placeholder="120/80"
                value={form.ta || ''}
                onChange={set('ta')}
              />
              <Input
                label="FC/FR (lpm/rpm)"
                placeholder="70/16"
                value={form.fcfr || ''}
                onChange={set('fcfr')}
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Anamnesis */}
        <Card title="Anamnesis" subtitle="Historia clínica y motivo de consulta">
          <div className="pt-2 space-y-4">
            <Input
              label="Diagnóstico"
              placeholder="Ej: Lumbalgia crónica, Esguince de tobillo..."
              value={form.diagnostico || ''}
              onChange={set('diagnostico')}
            />
            <Textarea
              label="Motivo de consulta"
              placeholder="Describa el motivo principal de la consulta..."
              value={form.motivo || ''}
              onChange={set('motivo')}
              rows={3}
            />
            <Textarea
              label="Tratamientos previos"
              placeholder="Tratamientos kinesiológicos, médicos, quirúrgicos anteriores..."
              value={form.tratamientos_prev || ''}
              onChange={set('tratamientos_prev')}
              rows={3}
            />
          </div>
        </Card>

        {/* Section 4: Antecedentes */}
        <Card title="Antecedentes y Hábitos" subtitle="Historia médica y estilo de vida">
          <div className="pt-2 space-y-4">
            <Textarea
              label="Antecedentes"
              placeholder="Antecedentes patológicos, quirúrgicos, familiares, alergias..."
              value={form.antecedentes || ''}
              onChange={set('antecedentes')}
              rows={3}
            />
            <Textarea
              label="Hábitos"
              placeholder="Actividad física, tabaquismo, consumo de alcohol, alimentación..."
              value={form.habitos || ''}
              onChange={set('habitos')}
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
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear paciente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
