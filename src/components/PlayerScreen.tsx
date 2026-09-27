import { useEffect, useMemo, useState } from 'react'
import type { Exercise } from '../types'
import { TIPO_PESO_LABEL } from '../types'
import { getHistory, getLastSession, getPeso, isSetDone, setPeso, toggleSetDone, type Profile } from '../lib/storage'
import ExerciseMedia from './ExerciseMedia'
import { EXERCISE_MEDIA } from '../data/media'

const round05 = (n: number) => Math.round(n * 2) / 2
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const demoLink = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' ejercicio técnica')}`

// Chip con el tiempo de la sesión actual: arranca de 0 en cada EMPEZAR
// y se congela al TERMINAR.
function TimerChip({ profile, date }: { profile: Profile; date: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ses = getLastSession(profile, date)
  const s = ses ? Math.max(0, Math.floor(((ses.endTs ?? now) - ses.startTs) / 1000)) : 0
  return (
    <span className="rounded-full bg-[#B2EE37]/15 px-2.5 py-1 text-xs font-black tabular-nums text-[#B2EE37]">
      ⏱ {fmtClock(s)}
    </span>
  )
}

interface Props {
  ex: Exercise
  profile: Profile
  date: string // día que se está registrando
  index: number
  total: number
  isLast: boolean
  onPrev: () => void
  onComplete: () => void // -> va al descanso / fin
}

// Un ejercicio a la vez: esquema, peso, calentamiento calculado, series, técnica destacada, next.
export default function PlayerScreen({ ex, profile, date, index, total, isLast, onPrev, onComplete }: Props) {
  // Clave de peso: por ejercicio (se hereda entre semanas), no por hueco de rutina.
  const wKey = ex.mediaKey ?? ex.id
  const [peso, setPesoState] = useState<number | ''>(() => getPeso(profile, wKey))
  const [showAlt, setShowAlt] = useState(false)
  const [showRpe, setShowRpe] = useState(false)
  const [, force] = useState(0)

  const calent = useMemo(() => {
    if (peso === '' || peso <= 0) return ex.calentDetalle.map(c => ({ ...c, kg: null as number | null }))
    return ex.calentDetalle.map(c => ({ ...c, kg: round05((peso as number) * c.pct / 100) }))
  }, [peso, ex])

  const hist = getHistory(profile, wKey)
  const prev = hist.length >= 2 ? hist[hist.length - 2].peso : null
  const workDone = Array.from({ length: ex.workSets }, (_, i) => isSetDone(profile, `${date}:${ex.id}:work${i}`))
  const allWorkDone = workDone.every(Boolean)

  const onPeso = (v: string) => {
    const n = v === '' ? '' : Math.max(0, Number(v))
    setPesoState(n)
    if (n !== '' && n > 0) setPeso(profile, wKey, n, date)
  }
  const check = (setKey: string) => { toggleSetDone(profile, `${date}:${ex.id}:${setKey}`); force(x => x + 1) }
  const done = (setKey: string) => isSetDone(profile, `${date}:${ex.id}:${setKey}`)

  return (
    <div>
      {/* Progreso */}
      <div className="mb-1 flex items-center justify-between text-xs text-[#7C7C74]">
        <span>Ejercicio {index + 1} de {total}</span>
        <span className="flex items-center gap-2">
          <TimerChip profile={profile} date={date} />
          <span>{TIPO_PESO_LABEL[ex.tipoPeso]}</span>
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#23262c]">
        <div className="h-full rounded-full bg-[#B2EE37]" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {/* Título estilo referencia */}
      <h2 className="text-center text-2xl font-black uppercase tracking-wide">{ex.nombre}</h2>
      {ex.nombreEn && <p className="text-center text-xs font-bold uppercase tracking-wider text-[#7C7C74]">{ex.nombreEn}</p>}
      <p className="mb-2 text-center text-sm font-semibold text-[#B2EE37]">
        {ex.workSets} sets x {ex.workReps} reps
      </p>
      {(ex.descanso || ex.rpe) && (
        <div className="mb-1 flex items-center justify-center gap-2">
          {ex.descanso && (
            <span className="rounded-full bg-[#1f2227] px-3 py-1 text-[11px] font-black text-[#FCFCFC]">⏱ Descanso {ex.descanso}</span>
          )}
          {ex.rpe && (() => {
            const m = (ex.rpe as string).match(/\d+/)
            const n = m ? Number(m[0]) : NaN
            const rir = isNaN(n) ? '' : n >= 10 ? ' · al fallo' : ` · te sobran ~${10 - n}`
            return (
              <button onClick={() => setShowRpe(s => !s)}
                className="rounded-full bg-[#B2EE37]/15 px-3 py-1 text-[11px] font-black text-[#B2EE37]">
                RPE {ex.earlyRpe ? `${ex.earlyRpe}→` : ''}{ex.rpe}{rir} ⓘ
              </button>
            )
          })()}
        </div>
      )}
      {showRpe && ex.rpe && (
        <div onClick={() => setShowRpe(false)} className="mb-3 cursor-pointer rounded-2xl border border-[#B2EE37]/30 bg-[#B2EE37]/5 p-3.5 text-xs leading-relaxed">
          <p className="mb-1 font-black uppercase tracking-wider text-[#B2EE37]">¿Qué es RPE? (tócalo para cerrar)</p>
          <p>Del <b>1 al 10</b>, qué tan duras se sintieron las <b>últimas</b> repeticiones de tu serie. No es cuánto pesa, es cómo se sintió al final.</p>
          <p className="mt-1.5">Vale <b>solo para tu serie de trabajo</b> — el calentamiento siempre liviano, sin forzar.</p>
          {ex.earlyRpe && <p className="mt-1.5">Con 2 series: la <b>primera al RPE temprano ({ex.earlyRpe})</b> — fuerte pero guardando — y la <b>última al RPE final ({ex.rpe})</b>.</p>}
          {ex.lastSetTech && <p className="mt-1.5">🔥 <b>AL FALLO en la última serie:</b> haz reps hasta no poder más con buena forma. Si la forma se rompe, ahí paras.</p>}
          <p className="mt-1.5">Ejemplo con <b>10 reps y RPE 7</b>: busca un peso con el que hagas las 10, las primeras ~7 salen bien y las <b>últimas 3 cuestan pero salen con buena forma</b>.</p>
          <p className="mt-1.5 text-[#7C7C74]">
            · Si las 10 salen fáciles → poco peso, súbelo la próxima.<br />
            · Si no llegas a 10 o te desarmas → mucho peso, bájalo.<br />
            · RPE 10 = ni una más · 9 = 1 más · 8 = 2 más · 7 = 3 más · 6 = 4 más.
          </p>
        </div>
      )}

      {/* Técnica arriba del todo: el objetivo se ve antes de empezar */}
      {ex.tecnica.trim() !== '' && (
        <div className="mb-3 rounded-2xl border-l-4 border-[#B2EE37] bg-[#17191d] p-3.5">
          <p className="mb-1 text-xs font-black uppercase tracking-wider text-[#B2EE37]">⚡ Cómo hacerlo (técnica)</p>
          <p className="text-sm leading-relaxed text-[#FCFCFC]">{ex.tecnica}</p>
        </div>
      )}

      <ExerciseMedia ex={ex} big />

      <div className="mt-2 text-center">
        <a href={ex.video ?? ex.demoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-300 underline">
          ▶ Ver cómo se hace (video)
        </a>
      </div>

      {/* Peso */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button onClick={() => peso !== '' && onPeso(String(round05(Number(peso) - 2.5)))} className="h-12 w-12 rounded-2xl bg-[#1f2227] text-2xl font-black text-[#FCFCFC]">−</button>
        <div className="min-w-28 text-center">
          <input
            type="number" inputMode="decimal" min={0} step={0.5} value={peso} onChange={e => onPeso(e.target.value)}
            placeholder="0" className="w-28 rounded-2xl border border-[#2c2f36] bg-[#17191d] px-2 py-2 text-center text-3xl font-black"
          />
          <p className="mt-0.5 text-[11px] text-[#7C7C74]">kg de trabajo hoy</p>
        </div>
        <button onClick={() => onPeso(String(round05((peso === '' ? 0 : Number(peso)) + 2.5)))} className="h-12 w-12 rounded-2xl bg-[#1f2227] text-2xl font-black text-[#FCFCFC]">+</button>
      </div>
      {prev !== null && peso !== '' && Number(peso) !== prev && (
        <p className="mt-1 text-center text-xs text-[#7C7C74]">
          Última vez: {prev}kg {Number(peso) > prev ? <span className="font-bold text-[#55F670]">📈 +{round05(Number(peso) - prev)}kg</span> : <span>📉 {round05(Number(peso) - prev)}kg</span>}
        </p>
      )}

      {/* Calentamiento */}
      <h3 className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Calentamiento ({ex.calentSets})</h3>
      <div className="space-y-1.5">
        {calent.map((c, i) => {
          const k = `cal${i}`
          const d = done(k)
          return (
            <button key={k} onClick={() => check(k)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm ${d ? 'bg-[#55F670]/15 text-[#55F670] line-through' : 'bg-[#17191d]'}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${d ? 'border-[#55F670] bg-[#55F670] text-black' : 'border-[#3a3d43] text-transparent'}`}>✓</span>
              <span>S{i + 1} · {c.reps} reps {c.kg !== null ? <b className="text-[#FCFCFC]">@ {c.kg}kg</b> : <span className="text-[#7C7C74]">({c.pct}% — mete tu peso)</span>}</span>
            </button>
          )
        })}
      </div>

      {/* Series reales */}
      <h3 className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Series de trabajo</h3>
      <div className="space-y-2">
        {Array.from({ length: ex.workSets }, (_, i) => {
          const k = `work${i}`
          const d = done(k)
          const isLast = i === ex.workSets - 1
          const setRpe = ex.earlyRpe && !isLast ? ex.earlyRpe : ex.rpe
          const toFailure = isLast && !!ex.lastSetTech
          return (
            <button key={k} onClick={() => check(k)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ${d ? 'bg-[#55F670] text-black' : 'bg-[#FCFCFC] text-black'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 font-black ${d ? 'border-black bg-black text-[#55F670]' : 'border-black/20 text-transparent'}`}>✓</span>
              <span className="flex-1 text-base font-black">SET {i + 1} · {ex.workReps} reps {peso !== '' && peso > 0 ? `@ ${peso}kg` : ''}</span>
              {toFailure && <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-black text-white">🔥 AL FALLO</span>}
              {setRpe && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${d ? 'bg-black text-[#55F670]' : 'bg-black/10 text-black'}`}>RPE {setRpe}</span>}
            </button>
          )
        })}
      </div>

      {((ex.alts?.length ?? 0) > 0 || ex.alternativas.trim() !== '') && (
        <button onClick={() => setShowAlt(s => !s)} className="mt-3 w-full rounded-2xl bg-[#1f2227] px-3 py-2.5 text-xs font-bold text-[#B2EE37]">
          {showAlt ? '▲ Ocultar alternativas' : '⚙ Sin esta máquina? Ver alternativas'}
        </button>
      )}
      {showAlt && (
        <div className="mt-1.5 space-y-1.5">
          {ex.alts && ex.alts.length > 0 ? ex.alts.map(alt => {
            const entry = (alt.mediaKey && EXERCISE_MEDIA[alt.mediaKey]) || null
            const gif = entry?.gif || null
            return (
              <div key={alt.es} className="flex items-center gap-2 rounded-2xl bg-[#B2EE37]/10 p-2.5">
                {gif && <img src={gif} alt={alt.es} loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
                <div className="flex-1">
                  <p className="text-xs leading-relaxed text-[#FCFCFC]">{alt.es}</p>
                  {alt.en && <p className="text-[10px] font-bold uppercase tracking-wide text-[#7C7C74]">{alt.en}</p>}
                  {entry?.approx && <p className="text-[10px] font-black text-amber-300">⚠ GIF referencial — mira el video</p>}
                </div>
                <a href={alt.video ?? demoLink(alt.es)} target="_blank" rel="noreferrer"
                  className="shrink-0 rounded-xl bg-[#B2EE37] px-2.5 py-1.5 text-[11px] font-black text-black">
                  ▶ Ver
                </a>
              </div>
            )
          }) : ex.alternativas.split(/\s+o\s+/).map(alt => (
            <div key={alt} className="flex items-center gap-2 rounded-2xl bg-[#B2EE37]/10 p-3">
              <p className="flex-1 text-xs leading-relaxed text-[#FCFCFC]">{alt}</p>
              <a href={demoLink(alt)} target="_blank" rel="noreferrer"
                className="shrink-0 rounded-xl bg-[#B2EE37] px-2.5 py-1.5 text-[11px] font-black text-black">
                ▶ Ver
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <div className="mt-4 flex gap-2 pb-2">
        <button onClick={onPrev} disabled={index === 0}
          className="rounded-2xl bg-[#1f2227] px-5 py-4 text-sm font-black disabled:opacity-30">‹</button>
        <button onClick={onComplete}
          className={`flex-1 rounded-2xl py-4 text-base font-black uppercase ${allWorkDone ? 'bg-[#B2EE37] text-black' : 'bg-[#B2EE37]/25 text-[#B2EE37]'}`}>
          {isLast ? 'Terminar rutina ✓' : allWorkDone ? 'Siguiente ›' : 'Siguiente › (sin completar)'}
        </button>
      </div>
    </div>
  )
}
