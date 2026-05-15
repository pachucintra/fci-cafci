import React, { useRef } from 'react'
import { PainPoint } from '../types'

interface BodyMapProps {
  points: PainPoint[]
  onChange: (points: PainPoint[]) => void
  readonly?: boolean
}

export const BodyMap: React.FC<BodyMapProps> = ({ points, onChange, readonly = false }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readonly) return
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Check if clicking near an existing point to remove it
    const THRESHOLD = 4
    const existing = points.findIndex(
      p => Math.abs(p.x - x) < THRESHOLD && Math.abs(p.y - y) < THRESHOLD
    )

    if (existing !== -1) {
      onChange(points.filter((_, i) => i !== existing))
    } else {
      onChange([...points, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }])
    }
  }

  const removePoint = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (readonly) return
    onChange(points.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden ${!readonly ? 'cursor-crosshair' : ''}`}
           style={{ width: '100%', maxWidth: 220 }}>
        <svg
          ref={svgRef}
          viewBox="0 0 200 380"
          className="w-full"
          onClick={handleSvgClick}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body outline */}
          <g fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Head */}
            <ellipse cx="100" cy="34" rx="22" ry="26" />
            {/* Neck */}
            <rect x="90" y="58" width="20" height="12" rx="4" />
            {/* Torso */}
            <path d="M65 70 Q58 72 55 80 L50 140 Q48 155 52 160 L55 170 L145 170 L148 160 Q152 155 150 140 L145 80 Q142 72 135 70 Z" />
            {/* Left shoulder area */}
            <path d="M65 70 L45 80 Q35 85 33 100 L30 140" />
            {/* Right shoulder area */}
            <path d="M135 70 L155 80 Q165 85 167 100 L170 140" />
            {/* Left forearm */}
            <path d="M30 140 Q28 160 26 175 L24 200" />
            {/* Right forearm */}
            <path d="M170 140 Q172 160 174 175 L176 200" />
            {/* Left hand */}
            <ellipse cx="23" cy="207" rx="8" ry="10" />
            {/* Right hand */}
            <ellipse cx="177" cy="207" rx="8" ry="10" />
            {/* Pelvis */}
            <path d="M55 170 Q52 185 50 195 L150 195 Q148 185 145 170" />
            {/* Left upper leg */}
            <path d="M50 195 L46 265 Q45 272 48 275" />
            {/* Right upper leg */}
            <path d="M150 195 L154 265 Q155 272 152 275" />
            {/* Left lower leg */}
            <path d="M48 275 L45 340 Q44 350 48 355" />
            {/* Right lower leg */}
            <path d="M152 275 L155 340 Q156 350 152 355" />
            {/* Left foot */}
            <path d="M48 355 Q44 360 40 362 L55 363 Q58 360 56 355" />
            {/* Right foot */}
            <path d="M152 355 Q156 360 160 362 L145 363 Q142 360 144 355" />
            {/* Clavicle hints */}
            <path d="M78 72 Q90 68 100 68 Q110 68 122 72" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* Ribcage hint */}
            <path d="M68 95 Q100 92 132 95" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M65 110 Q100 107 135 110" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M63 125 Q100 122 137 125" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M62 140 Q100 137 138 140" strokeWidth="1" strokeOpacity="0.3" />
          </g>

          {/* Pain points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x * 2}
                cy={pt.y * 3.8}
                r="7"
                fill="#ef4444"
                fillOpacity="0.25"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <circle
                cx={pt.x * 2}
                cy={pt.y * 3.8}
                r="3.5"
                fill="#ef4444"
                onClick={(e) => removePoint(i, e as unknown as React.MouseEvent)}
                className={!readonly ? 'cursor-pointer' : ''}
              />
            </g>
          ))}
        </svg>
      </div>

      {!readonly && (
        <p className="text-xs text-slate-400 text-center">
          Haz clic en el cuerpo para marcar zonas de dolor.<br />
          Haz clic en un punto rojo para eliminarlo.
        </p>
      )}

      {points.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 block" />
            {points.length} zona{points.length !== 1 ? 's' : ''} marcada{points.length !== 1 ? 's' : ''}
          </span>
          {!readonly && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
