import { useState } from 'react'
import { isConfigured } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { AppView, Patient, Session } from './types'
import { useToast } from './hooks/useToast'
import { Header } from './components/layout/Header'
import { ToastContainer } from './components/ui/Toast'
import { LoadingScreen } from './components/ui/Spinner'
import { SetupView } from './views/SetupView'
import { AuthView } from './views/AuthView'
import { PatientListView } from './views/PatientListView'
import { PatientFormView } from './views/PatientFormView'
import { PatientDetailView } from './views/PatientDetailView'
import { SessionFormView } from './views/SessionFormView'

export default function App() {
  const [configured, setConfigured] = useState(isConfigured())
  const [view, setView] = useState<AppView>('list')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const { toasts, addToast, removeToast } = useToast()
  const { user, loading: authLoading, signOut } = configured
    ? useAuth() // eslint-disable-line react-hooks/rules-of-hooks
    : { user: null, loading: false, signOut: async () => {} }

  const handleLogout = async () => {
    await signOut()
    addToast('Sesión cerrada', 'info')
  }

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

  const getHeaderProps = () => {
    const base = {
      onLogoClick: goToList,
      onLogout: handleLogout,
      userEmail: user?.email,
    }
    switch (view) {
      case 'list':
        return { ...base, onSettingsClick: () => setConfigured(false) }
      case 'patientForm':
        return {
          ...base,
          title: editingPatient ? `Editar: ${editingPatient.nombre} ${editingPatient.apellido}` : 'Nuevo Paciente',
          backLabel: 'Pacientes',
          onBack: editingPatient && selectedPatient ? () => goToDetail(selectedPatient) : goToList,
        }
      case 'detail':
        return {
          ...base,
          title: selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellido}` : '',
          backLabel: 'Pacientes',
          onBack: goToList,
        }
      case 'sessionForm':
        return {
          ...base,
          title: editingSession ? 'Editar sesión' : 'Nueva sesión',
          backLabel: selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellido}` : 'Paciente',
          onBack: selectedPatient ? () => goToDetail(selectedPatient) : goToList,
        }
      default:
        return base
    }
  }

  // 1. Not configured → Setup
  if (!configured) {
    return (
      <>
        <SetupView onComplete={() => { setConfigured(true); goToList() }} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  // 2. Configured but checking auth session
  if (authLoading) {
    return <LoadingScreen message="Verificando sesión..." />
  }

  // 3. Configured but not logged in → Auth
  if (!user) {
    return (
      <>
        <AuthView onAuthenticated={goToList} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  // 4. Fully authenticated → App
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
              if (editingPatient && selectedPatient) goToDetail(selectedPatient)
              else goToList()
            }}
            onSaved={(patient) => {
              goToDetail(patient)
              addToast(editingPatient ? 'Paciente actualizado' : 'Paciente creado', 'success')
            }}
            addToast={addToast}
          />
        )}

        {view === 'detail' && selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            onBack={goToList}
            onEditPatient={(p) => { setEditingPatient(p); setView('patientForm') }}
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
            onSaved={() => goToDetail(selectedPatient)}
            addToast={addToast}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
