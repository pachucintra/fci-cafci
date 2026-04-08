const BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function get<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`
  let res: Response
  try {
    res = await fetch(url)
  } catch (e) {
    throw new Error(`Network error: ${e}`)
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} — ${path} — ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

export interface Fondo {
  nombre: string
  clase: string
  tipo: string
  vcp: number
  variacion: number
  fecha: string
}

interface RawEntry {
  fondo?: string
  nombre?: string
  clase?: string
  vcp?: number
  variacion?: number
  fecha?: string
  [key: string]: unknown
}

const CATEGORIAS = [
  { path: '/argentinadatos/v1/finanzas/fci/mercadoDinero', tipo: 'Mercado de Dinero' },
  { path: '/argentinadatos/v1/finanzas/fci/rentaFija', tipo: 'Renta Fija' },
  { path: '/argentinadatos/v1/finanzas/fci/rentaVariable', tipo: 'Renta Variable' },
  { path: '/argentinadatos/v1/finanzas/fci/rentaMixta', tipo: 'Renta Mixta' },
]

function latestPerFund(raw: RawEntry[], tipo: string): Fondo[] {
  // Some endpoints return all historical rows; keep only the latest per (fondo, clase)
  const map = new Map<string, RawEntry>()
  for (const item of raw) {
    const key = `${item.fondo ?? item.nombre ?? ''}|${item.clase ?? ''}`
    const existing = map.get(key)
    if (!existing || (item.fecha ?? '') > (existing.fecha ?? '')) {
      map.set(key, item)
    }
  }
  return Array.from(map.values()).map((item) => ({
    nombre: item.fondo ?? item.nombre ?? '',
    clase: item.clase ?? '',
    tipo,
    vcp: item.vcp ?? 0,
    variacion: item.variacion ?? 0,
    fecha: item.fecha ?? '',
  })).filter((f) => f.nombre !== '')
}

export async function getAllFondos(): Promise<Fondo[]> {
  const results = await Promise.allSettled(
    CATEGORIAS.map(({ path, tipo }) =>
      get<RawEntry[]>(path).then((data) => {
        if (!Array.isArray(data)) return []
        return latestPerFund(data, tipo)
      })
    )
  )

  const fondos: Fondo[] = []
  const errors: string[] = []
  for (const [i, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      fondos.push(...result.value)
    } else {
      errors.push(`${CATEGORIAS[i].tipo}: ${result.reason}`)
    }
  }

  if (fondos.length === 0 && errors.length > 0) {
    throw new Error(errors.join(' | '))
  }

  return fondos
}
