/**
 * CAFCI API client
 * Base URL: https://api.cafci.org.ar
 *
 * In development, Vite proxies /api → https://api.cafci.org.ar
 * In production, set VITE_API_BASE to your backend proxy URL
 */

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`CAFCI API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ─── Types mirroring the API responses ───────────────────────────────────────

interface ApiFondo {
  id: number
  nombre: string
  tipoFondo: { id: number; descripcion: string }
  gestora: { id: number; nombre: string }
}

interface ApiClase {
  id: number
  nombre: string
  moneda: string
}

interface ApiFichaRaw {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

interface ApiRendimientoRaw {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** List all funds. Supports optional search term. */
export async function getFondos(params?: {
  nombre?: string
  tipoFondoId?: number
  gestora?: number
  limit?: number
  page?: number
}): Promise<{ data: ApiFondo[]; total: number }> {
  const q = new URLSearchParams()
  if (params?.nombre) q.set('nombre', params.nombre)
  if (params?.tipoFondoId) q.set('tipoFondoId', String(params.tipoFondoId))
  if (params?.gestora) q.set('gestora', String(params.gestora))
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.page) q.set('page', String(params.page))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return get(`/fondo${qs}`)
}

/** Get the classes (series) for a given fund. */
export async function getClases(fondoId: number): Promise<{ data: ApiClase[] }> {
  return get(`/fondo/${fondoId}/clase`)
}

/** Get the fund class detail sheet (VCP, daily return, etc.). */
export async function getFicha(fondoId: number, claseId: number): Promise<ApiFichaRaw> {
  return get(`/fondo/${fondoId}/clase/${claseId}/ficha`)
}

/** Get historical yield between two dates (yyyy-MM-dd). */
export async function getRendimiento(
  fondoId: number,
  claseId: number,
  desde: string,
  hasta: string,
): Promise<ApiRendimientoRaw> {
  return get(`/fondo/${fondoId}/clase/${claseId}/rendimiento/${desde}/${hasta}`)
}

// ─── Helpers to extract normalised values from raw API responses ──────────────

export function extractVcp(raw: ApiFichaRaw): number | undefined {
  return raw?.data?.info?.diaria?.vcp ?? raw?.data?.vcp
}

export function extractVcpAyer(raw: ApiFichaRaw): number | undefined {
  return raw?.data?.info?.diaria?.vcpAyer ?? raw?.data?.vcpAyer
}

export function extractRendimientoDiario(raw: ApiFichaRaw): number | undefined {
  return (
    raw?.data?.info?.diaria?.rendimientos?.day?.rendimiento ??
    raw?.data?.rendimientoDiario
  )
}

export function extractPatrimonio(raw: ApiFichaRaw): number | undefined {
  return raw?.data?.info?.diaria?.patrimonio ?? raw?.data?.patrimonio
}

/**
 * Extract the array of {fecha, vcp, rendimiento} points from a rendimiento response.
 * The API may return a single value or an array – we normalise both.
 */
export function extractSerie(
  raw: ApiRendimientoRaw,
): { fecha: string; vcp: number; rendimiento: number }[] {
  const d = raw?.data
  if (!d) return []

  // Array of daily data points
  if (Array.isArray(d)) {
    return d.map((item: { fecha?: string; vcp?: number; rendimiento?: number }) => ({
      fecha: item.fecha ?? '',
      vcp: item.vcp ?? 0,
      rendimiento: item.rendimiento ?? 0,
    }))
  }

  // Single aggregate rendimiento value
  if (typeof d.rendimiento === 'number') {
    return [{ fecha: '', vcp: 0, rendimiento: d.rendimiento }]
  }

  return []
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns a date string in yyyy-MM-dd format, offset by `daysBack` from today. */
export function dateStrDaysAgo(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().slice(0, 10)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
