export interface Patient {
  id: string
  created_at: string
  nombre: string
  apellido: string
  dni?: string
  fecha_nacimiento?: string
  sexo: string
  telefono?: string
  domicilio?: string
  ocupacion?: string
  estado_civil?: string
  peso?: number
  talla?: number
  ta?: string
  fcfr?: string
  diagnostico?: string
  motivo?: string
  tratamientos_prev?: string
  antecedentes?: string
  habitos?: string
  sessions?: Session[]
}

export interface Session {
  id: string
  created_at: string
  patient_id: string
  fecha: string
  dolor: number
  evaluacion: string
  tratamiento: string
  ejercicios: string
  observaciones: string
  puntos: PainPoint[]
}

export interface PainPoint {
  x: number
  y: number
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export type PatientFormData = Omit<Patient, 'id' | 'created_at' | 'sessions'>

export type SessionFormData = Omit<Session, 'id' | 'created_at'>

export type AppView = 'setup' | 'list' | 'patientForm' | 'detail' | 'sessionForm'
