import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getClases, getFicha, getRendimiento,
  extractVcp, extractVcpAyer, extractRendimientoDiario, extractPatrimonio,
  extractSerie, dateStrDaysAgo, today,
} from '../api/cafci'

interface Fondo {
  id: number
  nombre: string
  tipoFondo: { id: number; descripcion: string }
  gestora: { id: number; nombre: string }
}

interface Clase {
  id: number
  nombre: string
  moneda: string
}

interface Props {
  fondo: Fondo
  onClose: () => void
}

type Periodo = '7d' | '30d' | '90d' | '180d' | '365d'

const PERIODOS: { label: string; value: Periodo; days: number }[] = [
  { label: '7D', value: '7d', days: 7 },
  { label: '1M', value: '30d', days: 30 },
  { label: '3M', value: '90d', days: 90 },
  { label: '6M', value: '180d', days: 180 },
  { label: '1A', value: '365d', days: 365 },
]

function fmt(n: number | undefined, decimals = 2, prefix = '') {
  if (n === undefined || n === null) return '—'
  return prefix + n.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtMillones(n: number | undefined) {
  if (n === undefined) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return fmt(n, 0, '$')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'VCP' ? fmt(entry.value, 4, '$') : `${fmt(entry.value, 2)}%`}
        </p>
      ))}
    </div>
  )
}

export function FundDetail({ fondo, onClose }: Props) {
  const [clases, setClases] = useState<Clase[]>([])
  const [loadingClases, setLoadingClases] = useState(true)
  const [claseId, setClaseId] = useState<number | null>(null)

  const [vcp, setVcp] = useState<number | undefined>()
  const [vcpAyer, setVcpAyer] = useState<number | undefined>()
  const [rendimientoDiario, setRendimientoDiario] = useState<number | undefined>()
  const [patrimonio, setPatrimonio] = useState<number | undefined>()
  const [loadingFicha, setLoadingFicha] = useState(false)

  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [serie, setSerie] = useState<{ fecha: string; vcp: number; rendimiento: number }[]>([])
  const [loadingSerie, setLoadingSerie] = useState(false)
  const [activeChart, setActiveChart] = useState<'vcp' | 'rendimiento'>('vcp')

  // Load classes on mount
  useEffect(() => {
    setLoadingClases(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getClases(fondo.id).then((res: any) => {
      const data: Clase[] = res?.data ?? (Array.isArray(res) ? res : [])
      setClases(data)
      if (data.length > 0) setClaseId(data[0].id)
    }).catch(() => setClases([])).finally(() => setLoadingClases(false))
  }, [fondo.id])

  // Load ficha when class changes
  useEffect(() => {
    if (!claseId) return
    let cancelled = false
    setLoadingFicha(true)
    setVcp(undefined); setVcpAyer(undefined); setRendimientoDiario(undefined); setPatrimonio(undefined)
    getFicha(fondo.id, claseId).then((raw) => {
      if (cancelled) return
      setVcp(extractVcp(raw))
      setVcpAyer(extractVcpAyer(raw))
      setRendimientoDiario(extractRendimientoDiario(raw))
      setPatrimonio(extractPatrimonio(raw))
    }).catch(() => { }).finally(() => { if (!cancelled) setLoadingFicha(false) })
    return () => { cancelled = true }
  }, [fondo.id, claseId])

  // Load historical series when class or period changes
  useEffect(() => {
    if (!claseId) return
    let cancelled = false
    const days = PERIODOS.find((p) => p.value === periodo)?.days ?? 30
    setLoadingSerie(true)
    setSerie([])
    getRendimiento(fondo.id, claseId, dateStrDaysAgo(days), today())
      .then((raw) => { if (!cancelled) setSerie(extractSerie(raw)) })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoadingSerie(false) })
    return () => { cancelled = true }
  }, [fondo.id, claseId, periodo])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const rendPos = rendimientoDiario !== undefined && rendimientoDiario > 0
  const rendNeg = rendimientoDiario !== undefined && rendimientoDiario < 0
  const rendAcum = serie.reduce((acc, d) => acc + d.rendimiento, 0)
  const claseActual = clases.find((c) => c.id === claseId)

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="detail-header">
          <div>
            <div className="detail-tags">
              <span className="fund-tag">{fondo.tipoFondo.descripcion}</span>
              <span className="fund-gestora">{fondo.gestora.nombre}</span>
            </div>
            <h2 className="detail-nombre">{fondo.nombre}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Class selector */}
        <div className="clase-selector">
          <label className="clase-label">Clase / Serie</label>
          {loadingClases ? (
            <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
          ) : clases.length === 0 ? (
            <p className="modal-empty" style={{ padding: 0 }}>No se encontraron clases.</p>
          ) : (
            <div className="clase-chips">
              {clases.map((c) => (
                <button
                  key={c.id}
                  className={`clase-chip ${claseId === c.id ? 'active' : ''}`}
                  onClick={() => setClaseId(c.id)}
                >
                  {c.nombre}
                  {c.moneda && <span className="clase-moneda">{c.moneda}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KPIs */}
        {claseId && (
          <>
            <div className="detail-kpis">
              <div className="kpi">
                <span className="kpi-label">VCP actual</span>
                <span className="kpi-value">
                  {loadingFicha ? <span className="skeleton" style={{ width: 80, height: 20 }} /> : fmt(vcp, 4, '$')}
                </span>
              </div>
              <div className="kpi">
                <span className="kpi-label">VCP ayer</span>
                <span className="kpi-value">
                  {loadingFicha ? <span className="skeleton" style={{ width: 80, height: 20 }} /> : fmt(vcpAyer, 4, '$')}
                </span>
              </div>
              <div className="kpi">
                <span className="kpi-label">Rend. diario</span>
                <span className={`kpi-value rend ${rendPos ? 'pos' : rendNeg ? 'neg' : ''}`}>
                  {loadingFicha
                    ? <span className="skeleton" style={{ width: 60, height: 20 }} />
                    : rendimientoDiario !== undefined
                      ? `${rendPos ? '+' : ''}${fmt(rendimientoDiario, 2)}%`
                      : '—'}
                </span>
              </div>
              <div className="kpi">
                <span className="kpi-label">Patrimonio</span>
                <span className="kpi-value">
                  {loadingFicha ? <span className="skeleton" style={{ width: 80, height: 20 }} /> : fmtMillones(patrimonio)}
                </span>
              </div>
              <div className="kpi">
                <span className="kpi-label">Rend. período</span>
                <span className={`kpi-value rend ${rendAcum > 0 ? 'pos' : rendAcum < 0 ? 'neg' : ''}`}>
                  {loadingSerie
                    ? <span className="skeleton" style={{ width: 60, height: 20 }} />
                    : serie.length > 0 ? `${rendAcum > 0 ? '+' : ''}${fmt(rendAcum, 2)}%` : '—'}
                </span>
              </div>
            </div>

            {/* Chart controls */}
            <div className="chart-controls">
              <div className="chart-type-btns">
                <button className={`chart-type-btn ${activeChart === 'vcp' ? 'active' : ''}`} onClick={() => setActiveChart('vcp')}>VCP</button>
                <button className={`chart-type-btn ${activeChart === 'rendimiento' ? 'active' : ''}`} onClick={() => setActiveChart('rendimiento')}>Rendimiento %</button>
              </div>
              <div className="periodo-btns">
                {PERIODOS.map((p) => (
                  <button key={p.value} className={`periodo-btn ${periodo === p.value ? 'active' : ''}`} onClick={() => setPeriodo(p.value)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="chart-container">
              {loadingSerie ? (
                <div className="chart-loading"><div className="spinner" /><span>Cargando datos históricos…</span></div>
              ) : serie.length === 0 ? (
                <div className="chart-empty">
                  <p>No hay datos históricos para este período.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={serie} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      tickFormatter={(v: number) => activeChart === 'vcp' ? `$${v.toFixed(2)}` : `${v.toFixed(1)}%`}
                      width={70}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {activeChart === 'vcp'
                      ? <Line type="monotone" dataKey="vcp" name="VCP" stroke="var(--accent)" dot={false} strokeWidth={2} />
                      : <Line type="monotone" dataKey="rendimiento" name="Rendimiento %" stroke="var(--accent2)" dot={false} strokeWidth={2} />
                    }
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="detail-footer">
          <span>Fondo ID: <b>{fondo.id}</b></span>
          {claseActual && <span>Clase ID: <b>{claseActual.id}</b></span>}
          <a
            href={`https://www.cafci.org.ar/ficha-fondo.html?q=${fondo.id};${claseId ?? ''}`}
            target="_blank" rel="noreferrer" className="detail-link"
          >
            Ver en CAFCI.org.ar ↗
          </a>
        </div>
      </div>
    </div>
  )
}
