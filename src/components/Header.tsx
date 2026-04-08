import React from 'react'

interface Props {
  search: string
  onSearch: (v: string) => void
}

export function Header({ search, onSearch }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo">📊</span>
          <div>
            <h1 className="header-title">Dashboard FCI</h1>
            <p className="header-subtitle">Fondos Comunes de Inversión · CAFCI</p>
          </div>
        </div>
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar fondo por nombre..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
    </header>
  )
}
