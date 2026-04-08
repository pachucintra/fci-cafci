export interface FondoListItem {
  id: number
  nombre: string
  tipoFondo: {
    id: number
    descripcion: string
  }
  gestora: {
    id: number
    nombre: string
  }
}

export interface ClaseItem {
  id: number
  nombre: string
  moneda: string
  benchmarkId?: number
}

export interface FichaData {
  id: number
  nombre: string
  moneda: string
  vcp?: number
  vcpAyer?: number
  rendimientoDiario?: number
  patrimonio?: number
  // Raw data from API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any
}

export interface RendimientoData {
  fecha: string
  vcp: number
  rendimiento: number
}

export interface FondoDetalle {
  fondo: FondoListItem
  clase: ClaseItem
  ficha: FichaData
}

export interface FondoTracked {
  fondoId: number
  claseId: number
  nombre: string
  claseNombre: string
  gestora: string
  tipoFondo: string
}
