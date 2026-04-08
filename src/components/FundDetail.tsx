import { useEffect } from 'react'
import type { Fondo } from '../api/argentinadatos'

interface Props {
  fondo: Fondo
  onClose: () => void
}

function fmtVcp(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function fmtPatrimonio(n: number | null) {
  if (n === null || n === 0) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function FundDetail({ fondo, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cafciSearch = encodeURIComponent(fondo.nombre)

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>

        <div className="detail-header">
          <div>
            <div className="detail-tags">
              <span className="fund-tag">{fondo.tipo}</span>
              {fondo.clase && <span className="fund-gestora">{fondo.clase}</span>}
              {fondo.horizonte && <span className="fund-gestora">{fondo.horizonte}</span>}
            </div>
            <h2 className="detail-nombre">{fondo.nombre}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-kpis">
          <div className="kpi">
            <span className="kpi-label">VCP</span>
            <span className="kpi-value">${fmtVcp(fondo.vcp)}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Patrimonio</span>
            <span className="kpi-value">{fmtPatrimonio(fondo.patrimonio)}</span>
          </div>
          {fondo.fecha && (
            <div className="kpi">
              <span className="kpi-label">Fecha</span>
              <span className="kpi-value">{fondo.fecha}</span>
            </div>
          )}
          {fondo.horizonte && (
            <div className="kpi">
              <span className="kpi-label">Horizonte</span>
              <span className="kpi-value" style={{ textTransform: 'capitalize' }}>{fondo.horizonte}</span>
            </div>
          )}
        </div>

        <div className="detail-footer">
          <a
            href={`https://www.cafci.org.ar/buscador-de-fondos.html#${cafciSearch}`}
            target="_blank"
            rel="noreferrer"
            className="detail-link"
          >
            Ver en CAFCI.org.ar ↗
          </a>
        </div>
      </div>
    </div>
  )
}
