import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeftRight, Check, ChevronLeft, ChevronRight, ChevronUp, Flame, Hourglass, Info, Play, Timer, TrendingDown, TrendingUp } from 'lucide-react'
import type { Exercise } from '../types'
import { descansoMedio, TIPO_PESO_LABEL } from '../types'
import { firstLoadGuide } from '../lib/loadGuide'
import { getHistory, getLastSession, getPeso, isSetDone, setPeso, toggleSetDone, type HistEntry, type Profile } from '../lib/storage'
import { useStorageRev } from '../lib/useStorage'
import ExerciseMedia from './ExerciseMedia'
import { EXERCISE_MEDIA } from '../data/media'
import { beep } from './RestScreen'

function pesoTip(profile: Profile, ex: Exercise, semana: number, last: HistEntry | null, reps: string): { title: string; body: string } {
  if (!last) return firstLoadGuide(profile, ex)
  const nums = reps.match(/\d+/g)?.map(Number) ?? []
  const top = nums.length ? Math.max(...nums) : null
  if (semana === 1 || semana === 6) {
    return {
      title: 'La última vez',
      body: `Levantaste ${last.peso} kg. Prueba con eso. Esta semana no subas.`,
    }
  }
  const sube = top
    ? ` Si llegas a ${top} reps y todavía sobra, súbele un poco.`
    : ' Si te sobra al final, súbele un poco.'
  return {
    title: 'La última vez',
    body: `Levantaste ${last.peso} kg. Prueba con eso y mira cómo se siente.${sube}`,
  }
}

const round05 = (n: number) => Math.round(n * 2) / 2
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const demoLink = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' ejercicio técnica')}`

// Chip con el tiempo de la sesión: arranca al pasar a las pesas y se congela al terminar.
function TimerChip({ profile, date }: { profile: Profile; date: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ses = getLastSession(profile, date)
  const s = ses ? Math.max(0, Math.floor(((ses.endTs ?? now) - ses.startTs) / 1000)) : 0
  return (
    <span className="font-display inline-flex items-center gap-1 rounded-full bg-[#B2EE37]/15 px-2.5 py-1 text-xs font-semibold tabular-nums text-[#B2EE37]">
      <Timer className="h-3.5 w-3.5" strokeWidth={2.25} />
      {fmtClock(s)}
    </span>
  )
}

function SetRest({ until, total, onDone, onSkip }: { until: number; total: number; onDone: () => void; onSkip: () => void }) {
  const [now, setNow] = useState(() => Date.now())
  const fired = useRef(false)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, Math.ceil((until - now) / 1000))
  useEffect(() => {
    if (left > 0 || fired.current) return
    fired.current = true
    beep()
    onDone()
  }, [left, onDone])

  const r = 78
  const len = Math.PI * r
  const p = total > 0 ? Math.min(1, left / total) : 0
  return (
    <div id="set-rest" className="mb-3 flex flex-col items-center rounded-3xl bg-[#17191d] px-4 py-5">
      <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-[#B2EE37]">
        <Hourglass className="hourglass-flip h-4 w-4" strokeWidth={2.25} />
        Descanso entre series
      </p>
      <svg viewBox="0 0 200 118" className="mt-1 w-56" aria-hidden>
        <path d="M 22 100 A 78 78 0 0 1 178 100" fill="none" stroke="#23262c" strokeWidth="14" strokeLinecap="round" />
        <path d="M 22 100 A 78 78 0 0 1 178 100" fill="none" stroke="#B2EE37" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${p * len} ${len}`} />
      </svg>
      <p className="font-display -mt-10 text-5xl font-semibold tabular-nums">{fmtClock(left)}</p>
      <button onClick={onSkip} className="mt-4 min-h-12 w-full rounded-2xl bg-[#1f2227] text-base font-bold">
        Saltar
      </button>
    </div>
  )
}

interface Props {
  ex: Exercise
  profile: Profile
  date: string // día que se está registrando
  index: number
  total: number
  isLast: boolean
  semana: number
  onPrev: () => void
  onComplete: () => void // -> va al descanso / fin
}

// Un ejercicio a la vez: esquema, peso, calentamiento calculado, series, técnica destacada, next.
export default function PlayerScreen({ ex, profile, date, index, total, isLast, semana, onPrev, onComplete }: Props) {
  // Clave de peso: por ejercicio (se hereda entre semanas), no por hueco de rutina.
  const wKey = ex.mediaKey ?? ex.id
  const rev = useStorageRev()
  const [peso, setPesoState] = useState<number | ''>(() => getPeso(profile, wKey))
  useEffect(() => {
    if (document.activeElement?.id === 'peso-hoy') return
    setPesoState(getPeso(profile, wKey))
  }, [rev, profile, wKey])
  const [showAlt, setShowAlt] = useState(false)
  const [showRpe, setShowRpe] = useState(false)
  const [setRestUntil, setSetRestUntil] = useState<number | null>(null)
  const [, force] = useState(0)
  const setRestSecs = descansoMedio(ex.descanso, 90)

  useEffect(() => { setSetRestUntil(null) }, [ex.id])
  useEffect(() => {
    if (!setRestUntil) return
    document.getElementById('set-rest')?.scrollIntoView({ block: 'center' })
  }, [setRestUntil])

  const calent = useMemo(() => {
    if (peso === '' || peso <= 0) return ex.calentDetalle.map(c => ({ ...c, kg: null as number | null }))
    return ex.calentDetalle.map(c => ({ ...c, kg: round05((peso as number) * c.pct / 100) }))
  }, [peso, ex])

  const hist = getHistory(profile, wKey)
  const last = [...hist].reverse().find(h => h.date !== date) ?? null
  const prev = last?.peso ?? null
  const tip = pesoTip(profile, ex, semana, last, ex.workReps)
  const workDone = Array.from({ length: ex.workSets }, (_, i) => isSetDone(profile, `${date}:${ex.id}:work${i}`))
  const allWorkDone = workDone.every(Boolean)

  const onPeso = (v: string) => {
    const n = v === '' ? '' : Math.max(0, Number(v))
    setPesoState(n)
    if (n !== '' && n > 0) setPeso(profile, wKey, n, date)
  }
  const restingSet = setRestUntil != null
  const check = (setKey: string, startRest: boolean) => {
    if (restingSet) return
    const was = done(setKey)
    toggleSetDone(profile, `${date}:${ex.id}:${setKey}`)
    force(x => x + 1)
    if (was) setSetRestUntil(null)
    else if (startRest) setSetRestUntil(Date.now() + setRestSecs * 1000)
  }
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
      {ex.nombreEn && <p className="text-center text-sm font-bold uppercase tracking-wider text-[#7C7C74]">{ex.nombreEn}</p>}
      <p className="mb-2 text-center text-base font-semibold text-[#B2EE37]">
        {ex.workSets} sets x {ex.workReps} reps
      </p>
      {(ex.descanso || ex.rpe) && (
        <div className="mb-1 flex items-center justify-center gap-2">
          {ex.descanso && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1f2227] px-3 py-1.5 text-sm font-bold text-[#FCFCFC]">
              <Timer className="h-3.5 w-3.5" strokeWidth={2.25} /> Descanso {ex.descanso}
            </span>
          )}
          {ex.rpe && (() => {
            const m = (ex.rpe as string).match(/\d+/)
            const n = m ? Number(m[0]) : NaN
            const rir = isNaN(n) ? '' : n >= 10 ? ' · al fallo' : ` · te sobran ~${10 - n}`
            return (
              <button onClick={() => setShowRpe(s => !s)}
                className="rounded-full bg-[#B2EE37]/15 px-3 py-1.5 text-sm font-black text-[#B2EE37]">
                RPE {ex.earlyRpe ? `${ex.earlyRpe}→` : ''}{ex.rpe}{rir}
                <Info className="ml-1 inline h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )
          })()}
        </div>
      )}
      {showRpe && ex.rpe && (
        <div onClick={() => setShowRpe(false)} className="mb-3 cursor-pointer rounded-2xl border border-[#B2EE37]/30 bg-[#B2EE37]/5 p-3.5 text-sm leading-relaxed">
          <p className="mb-1 font-black uppercase tracking-wider text-[#B2EE37]">¿Qué es RPE? (tócalo para cerrar)</p>
          <p>Del <b>1 al 10</b>, qué tan duras se sintieron las <b>últimas</b> repeticiones de tu serie. No es cuánto pesa, es cómo se sintió al final.</p>
          <p className="mt-1.5">Vale <b>solo para tu serie de trabajo</b> — el calentamiento siempre liviano, sin forzar.</p>
          {ex.earlyRpe && <p className="mt-1.5">Con 2 series: la <b>primera al RPE temprano ({ex.earlyRpe})</b> — fuerte pero guardando — y la <b>última al RPE final ({ex.rpe})</b>.</p>}
          {ex.lastSetTech && <p className="mt-1.5 flex gap-1.5"><Flame className="mt-0.5 h-4 w-4 shrink-0 text-red-400" strokeWidth={2.25} /> <span><b>AL FALLO en la última serie:</b> haz reps hasta no poder más con buena forma. Si la forma se rompe, ahí paras.</span></p>}
          <p className="mt-1.5">Ejemplo con <b>10 reps y RPE 7</b>: busca un peso con el que hagas las 10, las primeras ~7 salen bien y las <b>últimas 3 cuestan pero salen con buena forma</b>.</p>
          <p className="mt-1.5 text-[#7C7C74]">
            · Si las 10 salen fáciles → poco peso, súbelo la próxima.<br />
            · Si no llegas a 10 o te desarmas → mucho peso, bájalo.<br />
            · RPE 10 = ni una más · 9 = 1 más · 8 = 2 más · 7 = 3 más · 6 = 4 más.
          </p>
        </div>
      )}

      {setRestUntil ? (
        <SetRest
          until={setRestUntil}
          total={setRestSecs}
          onDone={() => setSetRestUntil(null)}
          onSkip={() => setSetRestUntil(null)}
        />
      ) : (
        <>
          {ex.tecnica.trim() !== '' && (
            <div className="mb-3 rounded-2xl border-l-4 border-[#B2EE37] bg-[#17191d] p-3.5">
              <p className="mb-1 text-sm font-bold uppercase tracking-wider text-[#B2EE37]">Cómo hacerlo</p>
              <p className="text-base leading-relaxed text-[#FCFCFC]">{ex.tecnica}</p>
            </div>
          )}
          <ExerciseMedia ex={ex} big />
          <div className="mt-2 text-center">
            <a href={ex.video ?? ex.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 underline">
              <Play className="h-3.5 w-3.5" fill="currentColor" /> Ver cómo se hace
            </a>
          </div>
        </>
      )}

      {/* Peso */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button onClick={() => peso !== '' && onPeso(String(round05(Number(peso) - 2.5)))} className="h-14 w-14 rounded-2xl bg-[#1f2227] text-3xl font-black text-[#FCFCFC]">−</button>
        <div className="min-w-28 text-center">
          <input
            id="peso-hoy"
            type="number" inputMode="decimal" min={0} step={0.5} value={peso}
            onChange={e => onPeso(e.target.value)}
            onBlur={() => {
              if (peso === '' || Number(peso) <= 0) {
                const saved = getPeso(profile, wKey)
                if (saved !== '') setPesoState(saved)
              }
            }}
            placeholder="0" className="font-display w-28 rounded-2xl border border-[#2c2f36] bg-[#17191d] px-2 py-2 text-center text-3xl font-semibold"
          />
          <p className="mt-0.5 text-sm text-[#7C7C74]">kg de trabajo hoy</p>
          {peso !== '' && Number(peso) > 0 && <p className="text-xs text-[#55F670]">Guardado en este teléfono</p>}
        </div>
        <button onClick={() => onPeso(String(round05((peso === '' ? 0 : Number(peso)) + 2.5)))} className="h-14 w-14 rounded-2xl bg-[#1f2227] text-3xl font-black text-[#FCFCFC]">+</button>
      </div>
      <div className="mt-3 rounded-2xl bg-[#17191d] p-3 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-[#B2EE37]">{tip.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#FCFCFC]">{tip.body}</p>
      </div>
      {prev !== null && peso !== '' && Number(peso) !== prev && (
        <p className="mt-1 flex items-center justify-center gap-1 text-center text-xs text-[#7C7C74]">
          Última vez: <span className="font-display text-sm text-[#FCFCFC]">{prev} kg</span>
          {Number(peso) > prev
            ? <span className="inline-flex items-center gap-0.5 font-bold text-[#55F670]"><TrendingUp className="h-3.5 w-3.5" /> +{round05(Number(peso) - prev)} kg</span>
            : <span className="inline-flex items-center gap-0.5"><TrendingDown className="h-3.5 w-3.5" /> {round05(Number(peso) - prev)} kg</span>}
        </p>
      )}

      {/* Calentamiento */}
      <h3 className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Calentamiento ({ex.calentSets})</h3>
      <div className="space-y-1.5">
        {calent.map((c, i) => {
          const k = `cal${i}`
          const d = done(k)
          return (
            <button key={k} disabled={restingSet} onClick={() => check(k, true)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm disabled:opacity-40 ${d ? 'bg-[#55F670]/15 text-[#55F670] line-through' : 'bg-[#17191d]'}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${d ? 'border-[#55F670] bg-[#55F670] text-black' : 'border-[#3a3d43] text-transparent'}`}>
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
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
            <button key={k} disabled={restingSet} onClick={() => check(k, !isLast)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left disabled:opacity-40 ${d ? 'bg-[#55F670] text-black' : 'bg-[#FCFCFC] text-black'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 font-bold ${d ? 'border-black bg-black text-[#55F670]' : 'border-black/20 text-transparent'}`}>
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="flex-1 text-base font-black">SET {i + 1} · {ex.workReps} reps {peso !== '' && peso > 0 ? `@ ${peso}kg` : ''}</span>
              {toFailure && <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white"><Flame className="h-3 w-3" /> AL FALLO</span>}
              {setRpe && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${d ? 'bg-black text-[#55F670]' : 'bg-black/10 text-black'}`}>RPE {setRpe}</span>}
            </button>
          )
        })}
      </div>

      {((ex.alts?.length ?? 0) > 0 || ex.alternativas.trim() !== '') && (
        <button onClick={() => setShowAlt(s => !s)} className="mt-3 min-h-12 w-full rounded-2xl bg-[#1f2227] px-3 py-3 text-sm font-bold text-[#B2EE37]">
          {showAlt
            ? <span className="inline-flex items-center justify-center gap-1.5"><ChevronUp className="h-4 w-4" /> Ocultar alternativas</span>
            : <span className="inline-flex items-center justify-center gap-1.5"><ArrowLeftRight className="h-4 w-4" /> Sin esta máquina? Ver alternativas</span>}
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
                  <p className="text-sm leading-relaxed text-[#FCFCFC]">{alt.es}</p>
                  {alt.en && <p className="text-[10px] font-bold uppercase tracking-wide text-[#7C7C74]">{alt.en}</p>}
                  {entry?.approx && <p className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300"><AlertTriangle className="h-3 w-3" /> GIF referencial — mira el video</p>}
                </div>
                <a href={alt.video ?? demoLink(alt.es)} target="_blank" rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#B2EE37] px-2.5 py-1.5 text-[11px] font-bold text-black">
                  <Play className="h-3 w-3" fill="currentColor" /> Ver
                </a>
              </div>
            )
          }) : ex.alternativas.split(/\s+o\s+/).map(alt => (
            <div key={alt} className="flex items-center gap-2 rounded-2xl bg-[#B2EE37]/10 p-3">
              <p className="flex-1 text-xs leading-relaxed text-[#FCFCFC]">{alt}</p>
              <a href={demoLink(alt)} target="_blank" rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#B2EE37] px-2.5 py-1.5 text-[11px] font-bold text-black">
                <Play className="h-3 w-3" fill="currentColor" /> Ver
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <div className="mt-4 flex gap-2 pb-2">
        <button onClick={onPrev} disabled={index === 0 || restingSet}
          className="rounded-2xl bg-[#1f2227] px-5 py-4 text-sm font-bold disabled:opacity-30" aria-label="Ejercicio anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={onComplete} disabled={restingSet}
          className={`flex-1 rounded-2xl py-4 text-base font-black uppercase disabled:opacity-30 ${allWorkDone ? 'bg-[#B2EE37] text-black' : 'bg-[#B2EE37]/25 text-[#B2EE37]'}`}>
          {isLast ? 'Terminar rutina' : allWorkDone ? 'Siguiente' : 'Siguiente (sin completar)'}
          {!isLast && <ChevronRight className="ml-1 inline h-5 w-5" />}
          {isLast && <Check className="ml-1 inline h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
