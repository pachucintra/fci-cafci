import { useState, useEffect } from 'react'
import { isConfigured } from './lib/supabase'
import { AppView, Patient, Session } from './types'
import { useToast } from './hooks/useToast'
import { Header } from './components/layout/Header'
import { ToastContainer } from './components/ui/Toast'
import { SetupView } from './views/SetupView'
import { PatientListView } from './views/PatientListView'
import { PatientFormView } from './views/PatientFormView'
import { PatientDetailView } from './views/PatientDetailView'
import { SessionFormView } from './views/SessionFormView'

export default function App() {
  const [view, setView] = useState<AppView>(() =>
    isConfigured() ? 'list' : 'setup'
  )
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const { toasts, addToast, removeToast } = useToast()

  // Re-check config on changes
  useEffect(() => {
    if (!isConfigured() && view !== 'setup') {
      setView('setup')
    }
  }, [view])

  const goToList = () => {
    setView('list')
    setSelectedPatient(null)
    setEditingPatient(null)
    setEditingSession(null)
  }

  const goToDetail = (patient: Patient) => {
    setSelectedPatient(patient)
    setView('detail')
  }

  const goToNewPatient = () => {
    setEditingPatient(null)
    setView('patientForm')
  }

  const goToNewSession = (patient: Patient) => {
    setSelectedPatient(patient)
    setEditingSession(null)
    setView('sessionForm')
  }

  const goToEditSession = (session: Session, patient: Patient) => {
    setSelectedPatient(patient)
    setEditingSession(session)
    setView('sessionForm')
  }

  // Header props based on current view
  const getHeaderProps = () => {
    switch (view) {
      case 'setup':
        return { onLogoClick: goToList }
      case 'list':
        return {
          onLogoClick: goToList,
          onSettingsClick: () => setView('setup'),
        }
      case 'patientForm':
        return {
          onLogoClick: goToList,
          title: editingPatient
            ? `Editar: ${editingPatient.nombre} ${editingPatient.apellido}`
            : 'Nuevo Paciente',
          backLabel: 'Pacientes',
          onBack: editingPatient && selectedPatient
            ? () => goToDetail(selectedPatient)
            : goToList,
        }
      case 'detail':
        return {
          onLogoClick: goToList,
          title: selectedPatient
            ? `${selectedPatient.nombre} ${selectedPatient.apellido}`
            : '',
          backLabel: 'Pacientes',
          onBack: goToList,
        }
      case 'sessionForm':
        return {
          onLogoClick: goToList,
          title: editingSession ? 'Editar sesión' : 'Nueva sesión',
          backLabel: selectedPatient
            ? `${selectedPatient.nombre} ${selectedPatient.apellido}`
            : 'Paciente',
          onBack: selectedPatient ? () => goToDetail(selectedPatient) : goToList,
        }
      default:
        return { onLogoClick: goToList }
    }
  }

  if (view === 'setup') {
    return (
      <>
        <SetupView
          onComplete={() => {
            setView('list')
            addToast('Supabase configurado correctamente', 'success')
          }}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header {...getHeaderProps()} />

      <main>
        {view === 'list' && (
          <PatientListView
            onSelectPatient={goToDetail}
            onNewPatient={goToNewPatient}
          />
        )}

        {view === 'patientForm' && (
          <PatientFormView
            patient={editingPatient}
            onBack={() => {
              if (editingPatient && selectedPatient) {
                goToDetail(selectedPatient)
              } else {
                goToList()
              }
            }}
            onSaved={(patient) => {
              goToDetail(patient)
              addToast(
                editingPatient ? 'Paciente actualizado' : 'Paciente creado',
                'success'
              )
            }}
            addToast={addToast}
          />
        )}

        {view === 'detail' && selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            onBack={goToList}
            onEditPatient={(p) => {
              setEditingPatient(p)
              setView('patientForm')
            }}
            onNewSession={goToNewSession}
            onEditSession={goToEditSession}
            onPatientDeleted={goToList}
            addToast={addToast}
          />
        )}

        {view === 'sessionForm' && selectedPatient && (
          <SessionFormView
            patient={selectedPatient}
            session={editingSession}
            onBack={() => goToDetail(selectedPatient)}
            onSaved={() => {
              goToDetail(selectedPatient)
            }}
            addToast={addToast}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
