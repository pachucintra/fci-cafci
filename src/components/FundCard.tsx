import type { Fondo } from '../api/argentinadatos'

interface Props {
  fondo: Fondo
  onClick: () => void
}

function fmtVcp(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function fmtPatrimonio(n: number | null): string | null {
  if (n === null || n === 0) return null
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`
  return `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function FundCard({ fondo, onClick }: Props) {
  const patrimStr = fmtPatrimonio(fondo.patrimonio)

  return (
    <div className="fund-card" onClick={onClick}>
      <div className="fund-card-header">
        <span className="fund-tag">{fondo.tipo}</span>
        {fondo.horizonte && <span className="fund-horizonte">{fondo.horizonte}</span>}
      </div>
      <h3 className="fund-nombre">{fondo.nombre}</h3>
      <div className="fund-footer">
        <span className="fund-vcp">VCP ${fmtVcp(fondo.vcp)}</span>
        {fondo.clase && <span className="fund-clase-badge">{fondo.clase}</span>}
      </div>
      {patrimStr && <p className="fund-patrimonio">{patrimStr}</p>}
    </div>
  )
}
