import React, { useState, useMemo } from 'react'
import { Search, Plus, Users, Calendar, Activity, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { usePatients } from '../hooks/usePatients'
import { useAllSessionStats } from '../hooks/useSessions'
import { Patient } from '../types'
import { StatCard } from '../components/StatCard'
import { Badge, getPainBadgeVariant } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { LoadingScreen } from '../components/ui/Spinner'

interface PatientListViewProps {
  onSelectPatient: (patient: Patient) => void
  onNewPatient: () => void
}

const calculateAge = (fechaNac?: string): string => {
  if (!fechaNac) return '—'
  const birth = new Date(fechaNac)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} años`
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export const PatientListView: React.FC<PatientListViewProps> = ({ onSelectPatient, onNewPatient }) => {
  const { patients, loading, error, fetchPatients } = usePatients()
  const { stats, loading: statsLoading } = useAllSessionStats()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return patients
    return patients.filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
      (p.dni || '').toLowerCase().includes(q) ||
      (p.diagnostico || '').toLowerCase().includes(q)
    )
  }, [patients, search])

  if (loading) return <LoadingScreen message="Cargando pacientes..." />

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total pacientes"
          value={loading ? '—' : patients.length}
          icon={<Users className="h-5 w-5" />}
          color="teal"
        />
        <StatCard
          label="Total sesiones"
          value={statsLoading ? '—' : stats.total}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Activos (30 días)"
          value={statsLoading ? '—' : stats.activeLast30}
          icon={<Activity className="h-5 w-5" />}
          color="emerald"
          trend="Pacientes con sesión reciente"
        />
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o diagnóstico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-slate-400"
          />
        </div>
        <Button onClick={onNewPatient} icon={<Plus className="h-4 w-4" />}>
          Nuevo paciente
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error al cargar pacientes</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchPatients} icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Patient list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          {search ? (
            <>
              <p className="text-slate-600 font-medium">Sin resultados para "{search}"</p>
              <p className="text-sm text-slate-400 mt-1">Intenta con otro nombre, DNI o diagnóstico</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSearch('')}>
                Limpiar búsqueda
              </Button>
            </>
          ) : (
            <>
              <p className="text-slate-600 font-medium">No hay pacientes registrados</p>
              <p className="text-sm text-slate-400 mt-1">Comienza agregando tu primer paciente</p>
              <Button className="mt-4" onClick={onNewPatient} icon={<Plus className="h-4 w-4" />}>
                Agregar paciente
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}
              {search && ` · búsqueda: "${search}"`}
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {filtered.map(patient => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onClick={() => onSelectPatient(patient)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface PatientRowProps {
  patient: Patient
  onClick: () => void
}

const PatientRow: React.FC<PatientRowProps> = ({ patient, onClick }) => {
  const sessions = patient.sessions || []
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null
  const age = calculateAge(patient.fecha_nacimiento)

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
          {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">
              {patient.apellido}, {patient.nombre}
            </span>
            {patient.diagnostico && (
              <Badge variant="teal">{patient.diagnostico}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400">{age}</span>
            {patient.dni && <span className="text-xs text-slate-400">DNI {patient.dni}</span>}
            {lastSession && (
              <span className="text-xs text-slate-400">
                Última sesión: {formatDate(lastSession.fecha)}
              </span>
            )}
          </div>
        </div>

        {/* Session info */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {sessions.length > 0 ? (
            <>
              <div className="text-right">
                <p className="text-xs text-slate-400">Sesiones</p>
                <p className="text-sm font-semibold text-slate-700">{sessions.length}</p>
              </div>
              {lastSession && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Último EVA</p>
                  <Badge variant={getPainBadgeVariant(lastSession.dolor)}>
                    {lastSession.dolor}/10
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Sin sesiones</p>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
      </div>
    </button>
  )
}
