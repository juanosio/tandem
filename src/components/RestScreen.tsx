import { useEffect, useRef, useState } from 'react'
import { getLastSession, type Profile } from '../lib/storage'

interface Props {
  profile: Profile
  date: string // día que se está registrando
  seconds: number
  hint?: string | null // rango sugerido del ejercicio, ej "3-5 min"
  nextName: string | null // null = era el último
  onSkip: () => void
  onDone: () => void
  remaining: { done: number; total: number }
}

function beep() {
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
export default function RestScreen({ profile, date, seconds, hint, nextName, onSkip, onDone, remaining }: Props) {
  const [left, setLeft] = useState(seconds)
  const [now, setNow] = useState(Date.now())
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => { setLeft(seconds) }, [seconds])

  useEffect(() => {
    if (left <= 0) { beep(); doneRef.current(); return }
    const t = setTimeout(() => { setLeft(l => l - 1); setNow(Date.now()) }, 1000)
    return () => clearTimeout(t)
  }, [left])

  const pct = Math.min(100, Math.max(0, (left / seconds) * 100))
  // Tiempo de la sesión actual (congelado si ya terminó).
  const ses = getLastSession(profile, date)
  const elapsed = ses ? Math.max(0, Math.floor(((ses.endTs ?? now) - ses.startTs) / 1000)) : 0
  const leftEx = remaining.total - remaining.done

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs font-black uppercase tracking-widest text-[#B2EE37]">Descanso</p>
      {hint && <p className="mt-1 text-[11px] font-bold text-[#7C7C74]">Sugerido del ejercicio: {hint}</p>}
      <p className="my-4 text-7xl font-black tabular-nums">{fmt(left)}</p>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#23262c]">
        <div className="h-full rounded-full bg-[#B2EE37] transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      {/* Estado de la sesión */}
      <div className="mb-1 grid w-full grid-cols-2 gap-2">
        <div className="rounded-2xl bg-[#17191d] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C74]">⏱ Entrenando</p>
          <p className="text-xl font-black tabular-nums">{fmt(elapsed)}</p>
        </div>
        <div className="rounded-2xl bg-[#17191d] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C74]">Te faltan</p>
          <p className="text-xl font-black">{leftEx} <span className="text-xs font-bold text-[#7C7C74]">de {remaining.total}</span></p>
        </div>
      </div>
      <p className="text-sm text-[#7C7C74]">
        {nextName ? <>Siguiente: <b className="text-[#FCFCFC]">{nextName}</b><br />Recupera y dale cuando suene.</> : 'Último ejercicio completado. ¡Buen trabajo!'}
      </p>
      <button onClick={onSkip} className="mt-6 w-full rounded-2xl bg-[#B2EE37] py-4 text-base font-black uppercase text-black">
        {nextName ? 'Ir al siguiente ›' : 'Ver resumen ✓'}
      </button>
      <button onClick={() => setLeft(l => l + 30)} className="mt-2 w-full rounded-2xl bg-[#1f2227] py-3 text-sm font-bold text-[#FCFCFC]">
        +30 seg
      </button>
    </div>
  )
}
