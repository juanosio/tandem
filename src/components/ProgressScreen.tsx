import { useMemo } from 'react'
import { DIAS } from '../types'
import { getDayExercises } from '../data/semanas'
import { fmtMin, getAvgMs, getFinishedDates, getHistory, getMarkedDates, type HistEntry, type Profile } from '../lib/storage'
import { useStorageRev } from '../lib/useStorage'
import MonthCalendar from './MonthCalendar'

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${Number(d)} ${MESES_CORTOS[Number(m) - 1]}`
}

function fmtKg(n: number): string {
  const v = Math.round(n * 10) / 10
  return Number.isInteger(v) ? String(v) : String(v)
}

function MiniChart({ data, gradId }: { data: HistEntry[]; gradId: string }) {
  const W = 320, H = 132, PADX = 16, PADT = 22, PADB = 26
  const pesos = data.map(d => d.peso)
  const min = Math.min(...pesos)
  const max = Math.max(...pesos)
  const span = max - min || 1
  const n = data.length
  const x = (i: number) => (n === 1 ? W / 2 : PADX + (i / (n - 1)) * (W - PADX * 2))
  const y = (p: number) => PADT + (1 - (p - min) / span) * (H - PADT - PADB)
  const coords = data.map((d, i) => ({ x: x(i), y: y(d.peso) }))
  const line = coords.map(c => `${c.x},${c.y}`).join(' ')
  const base = H - PADB
  const area = `${coords[0].x},${base} ${line} ${coords[n - 1].x},${base}`
  const showAll = n <= 4

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B2EE37" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#B2EE37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={PADX} y1={base} x2={W - PADX} y2={base} stroke="#2c2f36" strokeWidth="1" />
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke="#B2EE37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={i === n - 1 ? 5 : 3.5} fill={i === n - 1 ? '#B2EE37' : '#17191d'} stroke="#B2EE37" strokeWidth="2.5" />
          {(showAll || i === n - 1) && (
            <text
              x={c.x}
              y={c.y < 20 ? c.y + 16 : c.y - 8}
              fill={i === n - 1 ? '#B2EE37' : '#b7b7ae'}
              fontSize="13"
              fontWeight="600"
              fontFamily="Oswald, Impact, sans-serif"
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            >
              {fmtKg(data[i].peso)}
            </text>
          )}
        </g>
      ))}
      <text x={PADX} y={H - 6} fill="#7C7C74" fontSize="12" fontFamily="Inter, sans-serif">{shortDate(data[0].date)}</text>
      <text x={W - PADX} y={H - 6} fill="#7C7C74" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="end">{shortDate(data[n - 1].date)}</text>
    </svg>
  )
}

export default function ProgressScreen({
  profile, dia, setDia, semana,
}: {
  profile: Profile
  dia: string
  setDia: (d: string) => void
  semana: number
}) {
  const rev = useStorageRev()
  const finished = useMemo(() => getFinishedDates(profile), [profile, rev])
  const marked = useMemo(() => getMarkedDates(profile), [profile, rev])
  const trained = useMemo(() => new Set(marked), [marked])
  const monday = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const weekCount = marked.filter(t => t >= monday).length

  const list = getDayExercises(semana, dia, profile)
  const avg = getAvgMs(profile, dia)

  const dayHasWeight = useMemo(() => {
    const flags: Record<string, boolean> = {}
    for (const d of DIAS) {
      flags[d] = getDayExercises(semana, d, profile).some(e => getHistory(profile, e.mediaKey ?? e.id).length > 0)
    }
    return flags
  }, [semana, profile, rev])

  const rows = list.map(e => ({ e, h: getHistory(profile, e.mediaKey ?? e.id) }))
  const withWeight = rows.filter(r => r.h.length > 0)
  const without = rows.filter(r => r.h.length === 0)

  return (
    <div>
      <h2 className="mb-1 text-center text-2xl font-black uppercase">Progresión</h2>
      <p className="mb-3 text-center text-sm text-[#7C7C74]">Semana {semana} · {dia}</p>

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
      <div className="mb-4">
        <MonthCalendar trained={trained} semana={semana} />
      </div>

      <div className="mb-3 rounded-3xl bg-[#17191d]/90 p-3">
        <div className="mb-2 flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-base font-bold">Cómo te fue cada día</p>
            <p className="text-sm text-[#7C7C74]">Elige el día para ver los pesos de esa rutina.</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {DIAS.map(d => {
            const on = d === dia
            const logged = dayHasWeight[d]
            return (
              <button
                key={d}
                onClick={() => setDia(d)}
                aria-pressed={on}
                className={`flex min-h-16 flex-col items-center justify-center rounded-2xl ${on ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227] text-[#FCFCFC]'}`}
              >
                <span className="font-display text-lg font-semibold leading-none">{d.slice(0, 3)}</span>
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${logged ? (on ? 'bg-black' : 'bg-[#55F670]') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-2 flex items-end justify-between gap-2 px-1">
        <h3 className="text-xl font-bold">Pesos del {dia.toLowerCase()}</h3>
        <p className="text-sm text-[#7C7C74]">{withWeight.length}/{list.length}</p>
      </div>
      {withWeight.length > 0 && (
        <p className="mb-2 px-1 text-sm text-[#7C7C74]">Un punto por día. El número grande es el último kilo, comparado con la vez anterior.</p>
      )}

      {withWeight.length === 0 ? (
        <div className="rounded-3xl bg-[#17191d]/90 p-4 text-center">
          <p className="text-base font-bold">Todavía no hay pesos del {dia.toLowerCase()}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#7C7C74]">Cuando anotes los kilos al entrenar, aquí ves si vas subiendo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {withWeight.map(({ e, h }) => {
            const last = h[h.length - 1]
            const prev = h.length >= 2 ? h[h.length - 2] : null
            const delta = prev ? Math.round((last.peso - prev.peso) * 10) / 10 : null
            const gradId = `wg-${e.id.replace(/[^a-zA-Z0-9_-]/g, '')}`
            return (
              <div key={e.id} className="rounded-3xl bg-[#17191d]/90 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{e.nombre}</p>
                    <p className="text-sm text-[#7C7C74]">{e.workSets}×{e.workReps}</p>
                    {delta == null ? (
                      <p className="mt-1 text-sm text-[#7C7C74]">Primera anotación</p>
                    ) : (
                      <p className={`mt-1 text-sm font-semibold ${delta > 0 ? 'text-[#55F670]' : 'text-[#b7b7ae]'}`}>
                        {delta > 0 ? `+${fmtKg(delta)} kg` : delta < 0 ? `${fmtKg(delta)} kg` : 'Igual'}
                        <span className="font-normal text-[#7C7C74]"> que la vez anterior</span>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-4xl font-semibold leading-none text-[#B2EE37]">{fmtKg(last.peso)}</p>
                    <p className="mt-1 text-xs text-[#7C7C74]">kg · {shortDate(last.date)}</p>
                  </div>
                </div>
                {h.length >= 2 && <MiniChart data={h} gradId={gradId} />}
              </div>
            )
          })}

          {without.length > 0 && (
            <div className="rounded-3xl bg-[#17191d]/90 px-4 py-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Sin peso todavía</p>
              <ul className="space-y-2">
                {without.map(({ e }) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{e.nombre}</span>
                    <span className="shrink-0 text-[#7C7C74]">{e.workSets}×{e.workReps}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
