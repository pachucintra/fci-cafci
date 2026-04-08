import { useState, useEffect } from 'react'
import { getFicha, extractVcp, extractRendimientoDiario, extractPatrimonio } from '../api/cafci'
import type { FondoTracked } from '../types/fund'

interface Props {
  fondo: FondoTracked
  onClick: () => void
  onRemove: () => void
}

function fmt(n: number | undefined, decimals = 2, prefix = '') {
  if (n === undefined || n === null) return '—'
  return prefix + n.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtMillones(n: number | undefined) {
  if (n === undefined) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return fmt(n, 0, '$')
}

export function FundCard({ fondo, onClick, onRemove }: Props) {
  const [vcp, setVcp] = useState<number | undefined>()
  const [rendimiento, setRendimiento] = useState<number | undefined>()
  const [patrimonio, setPatrimonio] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getFicha(fondo.fondoId, fondo.claseId)
      .then((raw) => {
        if (cancelled) return
        setVcp(extractVcp(raw))
        setRendimiento(extractRendimientoDiario(raw))
        setPatrimonio(extractPatrimonio(raw))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [fondo.fondoId, fondo.claseId])

  const isPositive = rendimiento !== undefined && rendimiento > 0
  const isNegative = rendimiento !== undefined && rendimiento < 0

  return (
    <div className={`fund-card ${loading ? 'loading' : ''} ${error ? 'error' : ''}`} onClick={onClick}>
      <button
        className="fund-card-remove"
        title="Eliminar"
        onClick={(e) => { e.stopPropagation(); onRemove() }}
      >
        ✕
      </button>

      <div className="fund-card-header">
        <span className="fund-tag">{fondo.tipoFondo}</span>
        <span className="fund-gestora">{fondo.gestora}</span>
      </div>

      <h3 className="fund-nombre">{fondo.nombre}</h3>
      <p className="fund-clase">{fondo.claseNombre}</p>

      <div className="fund-metrics">
        {loading ? (
          <div className="skeleton-group">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : error ? (
          <p className="fund-error-msg">Error al cargar datos</p>
        ) : (
          <>
            <div className="metric">
              <span className="metric-label">VCP</span>
              <span className="metric-value">{fmt(vcp, 4, '$')}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Rend. diario</span>
              <span className={`metric-value rend ${isPositive ? 'pos' : isNegative ? 'neg' : ''}`}>
                {rendimiento !== undefined ? `${isPositive ? '+' : ''}${fmt(rendimiento, 2)}%` : '—'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Patrimonio</span>
              <span className="metric-value">{fmtMillones(patrimonio)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
