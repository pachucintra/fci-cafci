import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { FundCard } from './components/FundCard'
import { FundDetail } from './components/FundDetail'
import { getFondos } from './api/cafci'

interface Fondo {
  id: number
  nombre: string
  tipoFondo: { id: number; descripcion: string }
  gestora: { id: number; nombre: string }
}

const PAGE_SIZE = 50

export default function App() {
  const [fondos, setFondos] = useState<Fondo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedFondo, setSelectedFondo] = useState<Fondo | null>(null)
  const [tipos, setTipos] = useState<string[]>([])

  const fetchFondos = useCallback(async (p: number, nombre: string) => {
    setLoading(true)
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await getFondos({ nombre: nombre || undefined, limit: PAGE_SIZE, page: p })
      const data: Fondo[] = res?.data ?? (Array.isArray(res) ? res : [])

      if (p === 1) {
        setFondos(data)
        // collect unique tipos for filter chips
        const ts = [...new Set(data.map((f) => f.tipoFondo.descripcion))].sort()
        setTipos(ts)
      } else {
        setFondos((prev) => [...prev, ...data])
      }

      const total: number = res?.total ?? res?.count ?? data.length
      setHasMore(p * PAGE_SIZE < total)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchFondos(1, '')
  }, [fetchFondos])

  // Search with debounce
  useEffect(() => {
    setPage(1)
    const t = setTimeout(() => fetchFondos(1, search), 400)
    return () => clearTimeout(t)
  }, [search, fetchFondos])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchFondos(next, search)
  }

  const filtered = tipoFiltro === 'todos'
    ? fondos
    : fondos.filter((f) => f.tipoFondo.descripcion === tipoFiltro)

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
            <button className="btn-retry" onClick={() => fetchFondos(1, search)}>Reintentar</button>
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
              {filtered.map((f) => (
                <FundCard
                  key={f.id}
                  fondo={f}
                  onClick={() => setSelectedFondo(f)}
                />
              ))}
              {/* Skeleton cards while loading */}
              {loading && Array.from({ length: 12 }).map((_, i) => (
                <div key={`sk-${i}`} className="fund-card skeleton-card">
                  <div className="skeleton" style={{ width: '60%', height: 12, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '90%', height: 16, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '70%', height: 12 }} />
                </div>
              ))}
            </div>

            {hasMore && !loading && (
              <div className="load-more">
                <button className="btn-primary" onClick={loadMore}>
                  Cargar más fondos
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail panel */}
      {selectedFondo && (
        <FundDetail
          fondo={selectedFondo}
          onClose={() => setSelectedFondo(null)}
        />
      )}
    </div>
  )
}
