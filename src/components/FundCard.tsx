interface Fondo {
  id: number
  nombre: string
  tipoFondo: { id: number; descripcion: string }
  gestora: { id: number; nombre: string }
}

interface Props {
  fondo: Fondo
  onClick: () => void
}

export function FundCard({ fondo, onClick }: Props) {
  return (
    <div className="fund-card" onClick={onClick}>
      <div className="fund-card-header">
        <span className="fund-tag">{fondo.tipoFondo.descripcion}</span>
      </div>
      <h3 className="fund-nombre">{fondo.nombre}</h3>
      <p className="fund-gestora-name">{fondo.gestora.nombre}</p>
      <p className="fund-ver-detalle">Ver clases y rendimiento →</p>
    </div>
  )
}
