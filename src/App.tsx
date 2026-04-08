import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { FundCard } from './components/FundCard'
import { FundDetail } from './components/FundDetail'
import { FundSearchModal } from './components/FundSearchModal'
import type { FondoTracked } from './types/fund'

const STORAGE_KEY = 'fci_tracked_fondos'

const DEFAULT_FONDOS: FondoTracked[] = [
  { fondoId: 847, claseId: 2409, nombre: 'Fondo 847 – Demo', claseNombre: 'Clase 2409', gestora: 'CAFCI', tipoFondo: 'Renta Fija' },
]

function loadFondos(): FondoTracked[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as FondoTracked[]
  } catch { /* ignore */ }
  return DEFAULT_FONDOS
}

function saveFondos(fondos: FondoTracked[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fondos))
}

export default function App() {
  const [fondos, setFondos] = useState<FondoTracked[]>(loadFondos)
  const [search, setSearch] = useState('')
  const [selectedFondo, setSelectedFondo] = useState<FondoTracked | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    saveFondos(fondos)
  }, [fondos])

  const handleAdd = (
    fondoId: number,
    claseId: number,
    nombre: string,
    claseNombre: string,
    gestora: string,
    tipoFondo: string,
  ) => {
    const exists = fondos.some((f) => f.fondoId === fondoId && f.claseId === claseId)
    if (exists) return
    setFondos((prev) => [...prev, { fondoId, claseId, nombre, claseNombre, gestora, tipoFondo }])
  }

  const handleRemove = (fondoId: number, claseId: number) => {
    setFondos((prev) => prev.filter((f) => !(f.fondoId === fondoId && f.claseId === claseId)))
    if (selectedFondo?.fondoId === fondoId && selectedFondo?.claseId === claseId) {
      setSelectedFondo(null)
    }
  }

  const filtered = fondos.filter(
    (f) =>
      !search ||
      f.nombre.toLowerCase().includes(search.toLowerCase()) ||
      f.gestora.toLowerCase().includes(search.toLowerCase()) ||
      f.tipoFondo.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="app">
      <Header search={search} onSearch={setSearch} />

      <main className="main">
        {/* Toolbar */}
        <div className="toolbar">
          <p className="toolbar-count">
            {filtered.length} {filtered.length === 1 ? 'fondo' : 'fondos'} tracked
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Agregar fondo
          </button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No hay fondos guardados.</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Agregar mi primer fondo
            </button>
          </div>
        ) : (
          <div className="fund-grid">
            {filtered.map((f) => (
              <FundCard
                key={`${f.fondoId}-${f.claseId}`}
                fondo={f}
                onClick={() => setSelectedFondo(f)}
                onRemove={() => handleRemove(f.fondoId, f.claseId)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail panel */}
      {selectedFondo && (
        <FundDetail
          fondo={selectedFondo}
          onClose={() => setSelectedFondo(null)}
        />
      )}

      {/* Search/add modal */}
      {showModal && (
        <FundSearchModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
