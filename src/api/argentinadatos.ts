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
  patrimonio: number | null
  fecha: string
  horizonte: string
}

interface RawEntry {
  fondo?: string
  horizonte?: string
  fecha?: string | null
  vcp?: number | null
  ccp?: number | null
  patrimonio?: number | null
}

/** Returns YYYY/MM/DD for `daysBack` days ago in local time. */
function dateStr(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function parseFondo(raw: RawEntry, tipo: string): Fondo {
  const name = raw.fondo ?? ''
  const match = name.match(/^(.+?)\s+-\s+Clase\s+(.+)$/)
  const nombre = match ? match[1].trim() : name.trim()
  const clase = match ? match[2].trim() : ''
  return {
    nombre,
    clase,
    tipo,
    vcp: raw.vcp ?? 0,
    patrimonio: raw.patrimonio ?? null,
    fecha: raw.fecha ?? '',
    horizonte: raw.horizonte ?? '',
  }
}

/** Fetches a category endpoint, trying up to 4 days back to skip weekends/holidays. */
async function fetchCategory(apiPath: string, tipo: string): Promise<Fondo[]> {
  const errs: string[] = []
  for (let daysBack = 1; daysBack <= 4; daysBack++) {
    const path = `${apiPath}/${dateStr(daysBack)}`
    try {
      const data = await get<RawEntry[]>(path)
      if (!Array.isArray(data)) {
        errs.push(`${dateStr(daysBack)}: respuesta no es array`)
        continue
      }
      // Filter out metadata rows (null vcp or null fecha)
      const valid = data.filter((r) => r.vcp !== null && r.vcp !== undefined && r.fecha)
      if (valid.length > 0) {
        return valid.map((r) => parseFondo(r, tipo))
      }
      errs.push(`${dateStr(daysBack)}: 0 entradas válidas`)
    } catch (e) {
      errs.push(`${dateStr(daysBack)}: ${e}`)
    }
  }
  throw new Error(errs.join(' | '))
}

const CATEGORIAS = [
  { path: '/argentinadatos/v1/finanzas/fci/mercadoDinero', tipo: 'Mercado de Dinero' },
  { path: '/argentinadatos/v1/finanzas/fci/rentaFija', tipo: 'Renta Fija' },
  { path: '/argentinadatos/v1/finanzas/fci/rentaVariable', tipo: 'Renta Variable' },
  { path: '/argentinadatos/v1/finanzas/fci/rentaMixta', tipo: 'Renta Mixta' },
]

export async function getAllFondos(): Promise<Fondo[]> {
  const results = await Promise.allSettled(
    CATEGORIAS.map(({ path, tipo }) => fetchCategory(path, tipo))
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
