import React, { useState } from 'react'
import {
  User,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react'
import { Patient, Session } from '../types'
import { useSessions } from '../hooks/useSessions'
import { usePatients } from '../hooks/usePatients'
import { Button } from '../components/ui/Button'
import { Badge, getPainBadgeVariant } from '../components/ui/Badge'
import { InfoRow } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { LoadingScreen } from '../components/ui/Spinner'
import { PainChart } from '../components/PainChart'
import { BodyMap } from '../components/BodyMap'
import { Toast } from '../hooks/useToast'

interface PatientDetailViewProps {
  patient: Patient
  onBack: () => void
  onEditPatient: (patient: Patient) => void
  onNewSession: (patient: Patient) => void
  onEditSession: (session: Session, patient: Patient) => void
  onPatientDeleted: () => void
  addToast: (message: string, type?: Toast['type']) => void
}

type Tab = 'ficha' | 'sesiones' | 'evolucion'


const calculateAge = (fechaNac?: string): string => {
  if (!fechaNac) return ''
  const birth = new Date(fechaNac)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} años`
}

const painColor = (val: number): string => {
  if (val <= 3) return 'text-emerald-600'
  if (val <= 6) return 'text-amber-600'
  return 'text-red-600'
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onBack,
  onEditPatient,
  onNewSession,
  onEditSession,
  onPatientDeleted,
  addToast,
}) => {
  const [tab, setTab] = useState<Tab>('ficha')
  const [showDeletePatient, setShowDeletePatient] = useState(false)
  const [deletingPatient, setDeletingPatient] = useState(false)
  const { sessions, loading: sessionsLoading, deleteSession } = useSessions(patient.id)
  const { deletePatient } = usePatients()

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'ficha', label: 'Ficha', icon: <User className="h-4 w-4" /> },
    { id: 'sesiones', label: `Sesiones (${sessions.length})`, icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'evolucion', label: 'Evolución', icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const handleDeletePatient = async () => {
    setDeletingPatient(true)
    try {
      await deletePatient(patient.id)
      addToast('Paciente eliminado', 'success')
      onPatientDeleted()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
      setDeletingPatient(false)
      setShowDeletePatient(false)
    }
  }

  const age = calculateAge(patient.fecha_nacimiento)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />} className="mt-0.5">
          Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {patient.nombre} {patient.apellido}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {age && <span className="text-sm text-slate-500">{age}</span>}
                {patient.diagnostico && <Badge variant="teal">{patient.diagnostico}</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEditPatient(patient)}
                icon={<Edit className="h-3.5 w-3.5" />}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeletePatient(true)}
                icon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Eliminar
              </Button>
            </div>
          </div>

          {/* Quick info */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {patient.telefono && (
              <a
                href={`tel:${patient.telefono}`}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {patient.telefono}
              </a>
            )}
            {patient.domicilio && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {patient.domicilio}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-5">
        <div className="flex border-b border-slate-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                ${tab === t.id
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              {t.icon}
              <span className="hidden sm:block">{t.label}</span>
              <span className="sm:hidden">{t.id === 'ficha' ? 'Ficha' : t.id === 'sesiones' ? `Ses. (${sessions.length})` : 'Graf.'}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'ficha' && <FichaTab patient={patient} />}
          {tab === 'sesiones' && (
            <SesionesTab
              sessions={sessions}
              loading={sessionsLoading}
              patient={patient}
              onNewSession={() => onNewSession(patient)}
              onEditSession={(s) => onEditSession(s, patient)}
              onDeleteSession={async (id) => {
                try {
                  await deleteSession(id)
                  addToast('Sesión eliminada', 'success')
                } catch {
                  addToast('Error al eliminar sesión', 'error')
                }
              }}
            />
          )}
          {tab === 'evolucion' && (
            <EvolucionTab sessions={sessions} loading={sessionsLoading} />
          )}
        </div>
      </div>

      {/* Delete patient modal */}
      <Modal isOpen={showDeletePatient} onClose={() => setShowDeletePatient(false)} title="Eliminar paciente">
        <div className="p-6">
          <div className="flex gap-3 mb-5">
            <div className="p-2.5 bg-red-100 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                ¿Eliminar a {patient.nombre} {patient.apellido}?
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Esta acción eliminará al paciente y todas sus sesiones ({sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}).
                <strong className="text-red-600"> No se puede deshacer.</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeletePatient(false)}>Cancelar</Button>
            <Button variant="danger" loading={deletingPatient} onClick={handleDeletePatient}>
              Eliminar paciente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Sub-components

const FichaTab: React.FC<{ patient: Patient }> = ({ patient }) => {
  const bmi = patient.peso && patient.talla
    ? (patient.peso / Math.pow(patient.talla / 100, 2)).toFixed(1)
    : null

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos Personales</h4>
        <div className="divide-y divide-slate-50">
          <InfoRow label="Nombre completo" value={`${patient.nombre} ${patient.apellido}`} />
          <InfoRow label="DNI" value={patient.dni} />
          <InfoRow label="Fecha de nacimiento" value={patient.fecha_nacimiento ? `${patient.fecha_nacimiento.split('-').reverse().join('/')}` : undefined} />
          <InfoRow label="Sexo" value={patient.sexo} />
          <InfoRow label="Teléfono" value={patient.telefono} />
          <InfoRow label="Domicilio" value={patient.domicilio} />
          <InfoRow label="Ocupación" value={patient.ocupacion} />
          <InfoRow label="Estado civil" value={patient.estado_civil} />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Exploración Física</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {patient.peso && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Peso</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{patient.peso} kg</p>
            </div>
          )}
          {patient.talla && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Talla</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{patient.talla} cm</p>
            </div>
          )}
          {bmi && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">IMC</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{bmi}</p>
            </div>
          )}
          {patient.ta && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">T/A</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{patient.ta}</p>
            </div>
          )}
          {patient.fcfr && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">FC/FR</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{patient.fcfr}</p>
            </div>
          )}
        </div>
      </div>

      {(patient.diagnostico || patient.motivo || patient.tratamientos_prev) && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Anamnesis</h4>
          <div className="divide-y divide-slate-50">
            <InfoRow label="Diagnóstico" value={patient.diagnostico} />
            <InfoRow label="Motivo de consulta" value={patient.motivo} />
            <InfoRow label="Tratamientos previos" value={patient.tratamientos_prev} />
          </div>
        </div>
      )}

      {(patient.antecedentes || patient.habitos) && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Antecedentes y Hábitos</h4>
          <div className="divide-y divide-slate-50">
            <InfoRow label="Antecedentes" value={patient.antecedentes} />
            <InfoRow label="Hábitos" value={patient.habitos} />
          </div>
        </div>
      )}
    </div>
  )
}

interface SesionesTabProps {
  sessions: Session[]
  loading: boolean
  patient: Patient
  onNewSession: () => void
  onEditSession: (session: Session) => void
  onDeleteSession: (id: string) => Promise<void>
}

const SesionesTab: React.FC<SesionesTabProps> = ({
  sessions,
  loading,

  onNewSession,
  onEditSession,
  onDeleteSession,
}) => {
  if (loading) return <LoadingScreen message="Cargando sesiones..." />

  const reversed = [...sessions].reverse()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {sessions.length === 0
            ? 'Sin sesiones registradas'
            : `${sessions.length} sesión${sessions.length !== 1 ? 'es' : ''} registrada${sessions.length !== 1 ? 's' : ''}`}
        </p>
        <Button size="sm" onClick={onNewSession} icon={<Plus className="h-3.5 w-3.5" />}>
          Nueva sesión
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No hay sesiones registradas aún</p>
          <Button size="sm" className="mt-4" onClick={onNewSession} icon={<Plus className="h-3.5 w-3.5" />}>
            Registrar primera sesión
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {reversed.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={() => onEditSession(session)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const SessionCard: React.FC<{
  session: Session
  onEdit: () => void
  onDelete: () => Promise<void>
}> = ({ session, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
    setShowDelete(false)
  }

  const [y, m, d] = session.fecha.split('-')
  const dateStr = `${d}/${m}/${y}`

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      {/* Session header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50">
        <div className="flex-1 flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">{dateStr}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">EVA:</span>
            <span className={`text-sm font-bold ${painColor(session.dolor)}`}>
              {session.dolor}/10
            </span>
            <Badge variant={getPainBadgeVariant(session.dolor)}>
              {session.dolor <= 3 ? 'Leve' : session.dolor <= 6 ? 'Moderado' : 'Intenso'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onEdit} icon={<Edit className="h-3.5 w-3.5" />} className="text-xs">
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDelete(true)}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Eliminar
          </Button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Session body */}
      {expanded && (
        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {session.evaluacion && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Evaluación</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{session.evaluacion}</p>
            </div>
          )}
          {session.tratamiento && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Tratamiento</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{session.tratamiento}</p>
            </div>
          )}
          {session.ejercicios && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ejercicios</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{session.ejercicios}</p>
            </div>
          )}
          {session.observaciones && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Observaciones</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{session.observaciones}</p>
            </div>
          )}
          {session.puntos && session.puntos.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mapa de dolor</p>
              <BodyMap points={session.puntos} onChange={() => {}} readonly />
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {showDelete && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">¿Eliminar esta sesión? No se puede deshacer.</p>
          <Button variant="ghost" size="sm" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Eliminar</Button>
        </div>
      )}
    </div>
  )
}

const EvolucionTab: React.FC<{ sessions: Session[]; loading: boolean }> = ({ sessions, loading }) => {
  if (loading) return <LoadingScreen message="Cargando evolución..." />

  const avg = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + s.dolor, 0) / sessions.length).toFixed(1)
    : '—'

  const first = sessions[0]
  const last = sessions[sessions.length - 1]
  const trend = first && last && sessions.length > 1
    ? last.dolor - first.dolor
    : null

  return (
    <div className="space-y-5">
      {sessions.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">Sesiones</p>
            <p className="text-xl font-bold text-slate-800">{sessions.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">EVA promedio</p>
            <p className="text-xl font-bold text-slate-800">{avg}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">Tendencia</p>
            {trend !== null ? (
              <p className={`text-xl font-bold ${trend < 0 ? 'text-emerald-600' : trend > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                {trend < 0 ? '↓' : trend > 0 ? '↑' : '→'} {Math.abs(trend)}
              </p>
            ) : (
              <p className="text-xl font-bold text-slate-400">—</p>
            )}
          </div>
        </div>
      )}

      <PainChart sessions={sessions} />
    </div>
  )
}
