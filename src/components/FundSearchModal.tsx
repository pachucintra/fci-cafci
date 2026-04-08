import React, { useState, useEffect } from 'react'
import { getFondos, getClases } from '../api/cafci'

interface Fondo {
  id: number
  nombre: string
  tipoFondo: { id: number; descripcion: string }
  gestora: { id: number; nombre: string }
}

interface Clase {
  id: number
  nombre: string
  moneda: string
}

interface Props {
  onAdd: (fondoId: number, claseId: number, fondoNombre: string, claseNombre: string, gestora: string, tipoFondo: string) => void
  onClose: () => void
}

export function FundSearchModal({ onAdd, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [fondos, setFondos] = useState<Fondo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFondo, setSelectedFondo] = useState<Fondo | null>(null)
  const [clases, setClases] = useState<Clase[]>([])
  const [loadingClases, setLoadingClases] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await getFondos({ nombre: query.trim(), limit: 20 })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any).data ?? (Array.isArray(res) ? res : [])
      setFondos(data)
    } catch (e) {
      setError('Error al buscar fondos. Verificá tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  const selectFondo = async (fondo: Fondo) => {
    setSelectedFondo(fondo)
    setLoadingClases(true)
    setClases([])
    try {
      const res = await getClases(fondo.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any).data ?? (Array.isArray(res) ? res : [])
      setClases(data)
    } catch {
      setClases([])
    } finally {
      setLoadingClases(false)
    }
  }

  const handleAddClase = (clase: Clase) => {
    if (!selectedFondo) return
    onAdd(
      selectedFondo.id,
      clase.id,
      selectedFondo.nombre,
      clase.nombre,
      selectedFondo.gestora.nombre,
      selectedFondo.tipoFondo.descripcion,
    )
    onClose()
  }

  // Handle manual ID input fallback
  const [manualMode, setManualMode] = useState(false)
  const [manualFondoId, setManualFondoId] = useState('')
  const [manualClaseId, setManualClaseId] = useState('')

  const handleManualAdd = () => {
    const fId = parseInt(manualFondoId, 10)
    const cId = parseInt(manualClaseId, 10)
    if (!fId || !cId) return
    onAdd(fId, cId, `Fondo ${fId}`, `Clase ${cId}`, '-', '-')
    onClose()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar fondo</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${!manualMode ? 'active' : ''}`}
            onClick={() => setManualMode(false)}
          >
            Buscar por nombre
          </button>
          <button
            className={`modal-tab ${manualMode ? 'active' : ''}`}
            onClick={() => setManualMode(true)}
          >
            Ingresar ID manual
          </button>
        </div>

        {!manualMode ? (
          <>
            <div className="modal-search-row">
              <input
                className="modal-input"
                placeholder="Nombre del fondo..."
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && search()}
                autoFocus
              />
              <button className="btn-primary" onClick={search} disabled={loading}>
                {loading ? 'Buscando…' : 'Buscar'}
              </button>
            </div>

            {error && <p className="modal-error">{error}</p>}

            {!selectedFondo ? (
              <div className="modal-results">
                {fondos.length === 0 && !loading && (
                  <p className="modal-empty">
                    {query ? 'Sin resultados. Probá otro nombre o usá "Ingresar ID manual".' : 'Ingresá un nombre para buscar.'}
                  </p>
                )}
                {fondos.map((f) => (
                  <div key={f.id} className="modal-result-item" onClick={() => selectFondo(f)}>
                    <div className="result-nombre">{f.nombre}</div>
                    <div className="result-meta">
                      <span className="tag">{f.tipoFondo.descripcion}</span>
                      <span className="result-gestora">{f.gestora.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="modal-clases">
                <button className="btn-back" onClick={() => setSelectedFondo(null)}>
                  ← Volver
                </button>
                <h3 className="clases-title">Clases de "{selectedFondo.nombre}"</h3>
                {loadingClases && <p className="modal-empty">Cargando clases…</p>}
                {clases.map((c) => (
                  <div key={c.id} className="modal-result-item" onClick={() => handleAddClase(c)}>
                    <div className="result-nombre">{c.nombre}</div>
                    <div className="result-meta">
                      <span className="tag">{c.moneda}</span>
                      <span className="result-gestora">ID: {c.id}</span>
                    </div>
                  </div>
                ))}
                {!loadingClases && clases.length === 0 && (
                  <p className="modal-empty">No se encontraron clases para este fondo.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="manual-form">
            <p className="manual-hint">
              Podés encontrar los IDs en la URL del sitio de CAFCI:<br />
              <code>ficha-fondo.html?q=<b>847</b>;<b>2409</b></code>
            </p>
            <label className="manual-label">
              ID del Fondo
              <input
                className="modal-input"
                type="number"
                placeholder="Ej: 847"
                value={manualFondoId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualFondoId(e.target.value)}
              />
            </label>
            <label className="manual-label">
              ID de la Clase
              <input
                className="modal-input"
                type="number"
                placeholder="Ej: 2409"
                value={manualClaseId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualClaseId(e.target.value)}
              />
            </label>
            <button
              className="btn-primary"
              onClick={handleManualAdd}
              disabled={!manualFondoId || !manualClaseId}
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
