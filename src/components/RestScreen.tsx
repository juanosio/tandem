import { useEffect, useState } from 'react'
import { Check, ChevronRight, Timer } from 'lucide-react'
import type { Exercise } from '../types'
import { getLastSession, type Profile } from '../lib/storage'
import ExerciseMedia from './ExerciseMedia'

interface Props {
  profile: Profile
  date: string // día que se está registrando
  until: number
  totalSecs: number
  hint?: string | null // rango sugerido del ejercicio, ej "3-5 min"
  nextName: string | null // null = era el último
  nextEx?: Exercise | null
  extraSecs: number
  onSkip: () => void
  onAdd: (secs: number) => void
  remaining: { done: number; total: number }
}

export function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.2, ctx.currentTime)
    o.start()
    o.stop(ctx.currentTime + 0.6)
    setTimeout(() => ctx.close(), 800)
  } catch { /* sin audio */ }
  try { navigator.vibrate?.(400) } catch { /* noop */ }
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Descanso entre ejercicios con cuenta atrás. Al terminar avisa y pasa solo al siguiente.
export default function RestScreen({ profile, date, until, totalSecs, hint, nextName, nextEx, extraSecs, onSkip, onAdd, remaining }: Props) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const left = Math.max(0, Math.ceil((until - now) / 1000))
  const pct = totalSecs > 0 ? Math.min(100, Math.max(0, (left / totalSecs) * 100)) : 0
  // Tiempo de la sesión actual (congelado si ya terminó).
  const ses = getLastSession(profile, date)
  const elapsed = ses ? Math.max(0, Math.floor(((ses.endTs ?? now) - ses.startTs) / 1000)) : 0
  const leftEx = remaining.total - remaining.done

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-black uppercase tracking-widest text-[#B2EE37]">Descanso</p>
      {hint && <p className="mt-1 text-sm font-bold text-[#7C7C74]">Entre series era {hint}</p>}
      <p className="font-display my-4 text-7xl font-semibold tabular-nums">{fmt(left)}</p>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#23262c]">
        <div className="h-full rounded-full bg-[#B2EE37] transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      {/* Estado de la sesión */}
      <div className="mb-1 grid w-full grid-cols-2 gap-2">
        <div className="rounded-2xl bg-[#17191d] p-3">
          <p className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">
            <Timer className="h-3.5 w-3.5" strokeWidth={2.25} /> Entrenando
          </p>
          <p className="font-display text-xl font-semibold tabular-nums">{fmt(elapsed)}</p>
        </div>
        <div className="rounded-2xl bg-[#17191d] p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Te faltan</p>
          <p className="font-display text-xl font-semibold">{leftEx} <span className="font-sans text-xs font-bold text-[#7C7C74]">de {remaining.total}</span></p>
        </div>
      </div>
      {nextName ? (
        <div className="mt-2 w-full text-center">
          <p className="text-base text-[#7C7C74]">
            Siguiente: <b className="text-[#FCFCFC]">{nextName}</b>
          </p>
          {nextEx && <div className="mt-3"><ExerciseMedia ex={nextEx} big /></div>}
          <p className="mt-2 text-sm text-[#7C7C74]">
            {extraSecs > 0 ? `${fmt(extraSecs)} más que entre series. ` : 'El mismo descanso que entre series. '}
            Recupera y prepárate.
          </p>
        </div>
      ) : (
        <p className="text-base text-[#7C7C74]">Último ejercicio completado. ¡Buen trabajo!</p>
      )}
      <button onClick={onSkip} className="mt-6 w-full rounded-2xl bg-[#B2EE37] py-4 text-base font-black uppercase text-black">
        {nextName
          ? <span className="inline-flex items-center justify-center gap-1.5">Ir al siguiente <ChevronRight className="h-5 w-5" /></span>
          : <span className="inline-flex items-center justify-center gap-1.5">Ver resumen <Check className="h-5 w-5" /></span>}
      </button>
      <button onClick={() => onAdd(30)} className="mt-2 w-full rounded-2xl bg-[#1f2227] py-3.5 text-base font-bold text-[#FCFCFC]">
        +30 seg
      </button>
    </div>
  )
}
