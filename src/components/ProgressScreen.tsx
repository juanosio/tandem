import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { getDayExercises } from '../data/semanas'
import { fmtMin, getAvgMs, getFinishedDates, getHistory, getMarkedDates, getSessions, type HistEntry, type Profile } from '../lib/storage'
import MonthCalendar from './MonthCalendar'

// Gráfica de línea simple (SVG, sin dependencias) del peso en el tiempo.
function MiniChart({ data }: { data: HistEntry[] }) {
  const W = 320, H = 110, PAD = 14
  const pesos = data.map(d => d.peso)
  const min = Math.min(...pesos)
  const max = Math.max(...pesos)
  const span = max - min || 1
  const n = data.length
  const x = (i: number) => (n === 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2))
  const y = (p: number) => H - PAD - ((p - min) / span) * (H - PAD * 2 - 14)
  const pts = data.map((d, i) => `${x(i)},${y(d.peso)}`).join(' ')
  const up = pesos[n - 1] >= pesos[0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
      {/* línea base min */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#2c2f36" strokeWidth="1" />
      <polyline points={pts} fill="none" stroke={up ? '#55F670' : '#B2EE37'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.peso)} r={i === n - 1 ? 5 : 3.5} fill={i === n - 1 ? '#B2EE37' : '#0F1012'} stroke={up ? '#55F670' : '#B2EE37'} strokeWidth="2.5" />
          {i === n - 1 && (
            <text x={Math.min(x(i), W - 44)} y={Math.max(y(d.peso) - 8, 10)} fill="#B2EE37" fontSize="14" fontWeight="600" fontFamily="Oswald, Impact, sans-serif">{d.peso}kg</text>
          )}
        </g>
      ))}
      <text x={PAD} y={H - 2} fill="#7C7C74" fontSize="9">{data[0].date.slice(5)}</text>
      <text x={W - PAD} y={H - 2} fill="#7C7C74" fontSize="9" textAnchor="end">{data[n - 1].date.slice(5)}</text>
    </svg>
  )
}

// Progresión visual: stats + gráfica por ejercicio.
export default function ProgressScreen({ profile, dia, semana }: { profile: Profile; dia: string; semana: number }) {
  const finished = useMemo(() => getFinishedDates(profile), [profile])
  const marked = useMemo(() => getMarkedDates(profile), [profile])
  const trained = useMemo(() => new Set(marked), [marked])
  const monday = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const weekCount = marked.filter(t => t >= monday).length

  const list = getDayExercises(semana, dia, profile)
  const avg = getAvgMs(profile, dia)
  const sessions = getSessions(profile).filter(s => s.endTs !== null).length

  return (
    <div>
      <h2 className="mb-1 text-center text-2xl font-black uppercase">Progresión</h2>
      <p className="mb-3 text-center text-sm text-[#7C7C74]">Semana {semana} · Día: {dia} · pesos que has levantado en el tiempo</p>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-3xl bg-[#17191d]/90 p-3 text-center">
          <p className="font-display text-2xl font-semibold text-[#B2EE37]">{finished.length}</p>
          <p className="text-[11px] text-[#7C7C74]">rutinas listas</p>
        </div>
        <div className="rounded-3xl bg-[#17191d]/90 p-3 text-center">
          <p className="font-display text-2xl font-semibold text-[#B2EE37]">{weekCount}/5</p>
          <p className="text-[11px] text-[#7C7C74]">esta semana</p>
        </div>
        <div className="rounded-3xl bg-[#17191d]/90 p-3 text-center">
          <p className="font-display text-lg font-semibold text-[#B2EE37]">{avg ? fmtMin(avg) : '—'}</p>
          <p className="text-[11px] text-[#7C7C74]">promedio {dia.slice(0, 3)}</p>
        </div>
      </div>

      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Calendario · días que entrenaste</p>
      <div className="mb-3">
        <MonthCalendar trained={trained} />
      </div>

      <p className="mb-1.5 text-xs font-black uppercase tracking-wider text-[#7C7C74]">Pesos por ejercicio ({sessions} sesiones)</p>

      <div className="space-y-2">
        {list.map(e => {
          const h = getHistory(profile, e.mediaKey ?? e.id)
          const gain = h.length >= 2 ? h[h.length - 1].peso - h[0].peso : 0
          return (
            <div key={e.id} className="rounded-3xl bg-[#17191d]/90 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-base font-bold">{e.nombre}</p>
                {gain !== 0 && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${gain > 0 ? 'bg-[#55F670]/15 text-[#55F670]' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
                    {gain > 0 ? <span className="inline-flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +{gain} kg</span> : `${gain} kg`}
                  </span>
                )}
              </div>
              {h.length === 0 ? (
                <p className="mt-1 text-[11px] text-[#7C7C74]">Sin registros — mete tu peso entrenando y aquí verás la curva.</p>
              ) : h.length === 1 ? (
                <p className="mt-1 text-[11px] text-[#7C7C74]">Primer registro: <b className="text-[#FCFCFC]">{h[0].peso}kg</b> ({h[0].date}). Sigue así y verás la gráfica.</p>
              ) : (
                <MiniChart data={h} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
