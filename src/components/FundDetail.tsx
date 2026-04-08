import { useEffect } from 'react'
import type { Fondo } from '../api/argentinadatos'

interface Props {
  fondo: Fondo
  onClose: () => void
}

function fmtVcp(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

function fmtVar(n: number) {
  const pct = Math.abs(n) <= 1 ? n * 100 : n
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
}

export function FundDetail({ fondo, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const varPct = Math.abs(fondo.variacion) <= 1 ? fondo.variacion * 100 : fondo.variacion
  const isPos = varPct > 0
  const isNeg = varPct < 0

  const cafciSearch = encodeURIComponent(fondo.nombre)

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>

        <div className="detail-header">
          <div>
            <div className="detail-tags">
              <span className="fund-tag">{fondo.tipo}</span>
              {fondo.clase && <span className="fund-gestora">{fondo.clase}</span>}
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
            <span className="kpi-label">Variación diaria</span>
            <span className={`kpi-value rend ${isPos ? 'pos' : isNeg ? 'neg' : ''}`}>
              {fmtVar(fondo.variacion)}
            </span>
          </div>
          {fondo.fecha && (
            <div className="kpi">
              <span className="kpi-label">Fecha</span>
              <span className="kpi-value">{fondo.fecha}</span>
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
