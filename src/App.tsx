import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { FundCard } from './components/FundCard'
import { FundDetail } from './components/FundDetail'
import { getAllFondos, type Fondo } from './api/argentinadatos'

const PAGE_SIZE = 60

export default function App() {
  const [allFondos, setAllFondos] = useState<Fondo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [selectedFondo, setSelectedFondo] = useState<Fondo | null>(null)
  const [tipos, setTipos] = useState<string[]>([])

  const fetchFondos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllFondos()
      setAllFondos(data)
      const ts = [...new Set(data.map((f) => f.tipo))].sort()
      setTipos(ts)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFondos()
  }, [fetchFondos])

  // Reset page when search/filter changes
  useEffect(() => {
    setPage(1)
  }, [search, tipoFiltro])

  const filtered = allFondos
    .filter((f) => tipoFiltro === 'todos' || f.tipo === tipoFiltro)
    .filter((f) => !search || f.nombre.toLowerCase().includes(search.toLowerCase()))

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  return (
    <div className="app">
      <Header search={search} onSearch={setSearch} />

      <main className="main">
        {/* Tipo filter chips */}
        {tipos.length > 0 && (
          <div className="filter-chips">
            <button
              className={`chip ${tipoFiltro === 'todos' ? 'active' : ''}`}
              onClick={() => setTipoFiltro('todos')}
            >
              Todos
            </button>
            {tipos.map((t) => (
              <button
                key={t}
                className={`chip ${tipoFiltro === t ? 'active' : ''}`}
                onClick={() => setTipoFiltro(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && !error && (
          <p className="toolbar-count">{filtered.length} fondos</p>
        )}

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button className="btn-retry" onClick={fetchFondos}>Reintentar</button>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 && !loading && !error ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>No se encontraron fondos para "{search}"</p>
          </div>
        ) : (
          <>
            <div className="fund-grid">
              {visible.map((f, i) => (
                <FundCard
                  key={`${f.nombre}|${f.clase}|${i}`}
                  fondo={f}
                  onClick={() => setSelectedFondo(f)}
                />
              ))}
              {loading && Array.from({ length: 12 }).map((_, i) => (
                <div key={`sk-${i}`} className="fund-card skeleton-card">
                  <div className="skeleton" style={{ width: '60%', height: 12, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '90%', height: 16, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '50%', height: 14 }} />
                </div>
              ))}
            </div>

            {hasMore && !loading && (
              <div className="load-more">
                <button className="btn-primary" onClick={() => setPage((p) => p + 1)}>
                  Cargar más fondos
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedFondo && (
        <FundDetail
          fondo={selectedFondo}
          onClose={() => setSelectedFondo(null)}
        />
      )}
    </div>
  )
}
