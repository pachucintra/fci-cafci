import type { Fondo } from '../api/argentinadatos'

interface Props {
  fondo: Fondo
  onClick: () => void
}

function fmtVcp(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

function fmtVar(n: number) {
  // variacion from argentinadatos is a decimal fraction (0.005 = 0.5%)
  const pct = Math.abs(n) <= 1 ? n * 100 : n
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
}

export function FundCard({ fondo, onClick }: Props) {
  const varPct = Math.abs(fondo.variacion) <= 1 ? fondo.variacion * 100 : fondo.variacion
  const isPos = varPct > 0
  const isNeg = varPct < 0

  return (
    <div className="fund-card" onClick={onClick}>
      <div className="fund-card-header">
        <span className="fund-tag">{fondo.tipo}</span>
        <span className={`fund-var ${isPos ? 'pos' : isNeg ? 'neg' : ''}`}>
          {fmtVar(fondo.variacion)}
        </span>
      </div>
      <h3 className="fund-nombre">{fondo.nombre}</h3>
      <div className="fund-footer">
        <span className="fund-vcp">VCP ${fmtVcp(fondo.vcp)}</span>
        {fondo.clase && <span className="fund-clase-badge">{fondo.clase}</span>}
      </div>
    </div>
  )
}
