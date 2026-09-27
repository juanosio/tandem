import { useEffect, useState } from 'react'
import { clearAll, getRestGap, PROFILE_LABEL, setRestGap, type Profile } from '../lib/storage'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function SettingsScreen({
  profile, setProfile, semana, setSemana, semanas,
}: {
  profile: Profile
  setProfile: (p: Profile) => void
  semana: number
  setSemana: (s: number) => void
  semanas: number[]
}) {
  const [gap, setGap] = useState(() => getRestGap())
  const change = (d: number) => {
    const v = Math.min(180, Math.max(0, gap + d))
    setGap(v)
    setRestGap(v)
  }

  useEffect(() => {
    const el = document.getElementById(`set-sem-${semana}`)
    const parent = el?.parentElement
    if (!el || !parent) return
    parent.scrollTo({ left: el.offsetLeft - parent.clientWidth / 2 + el.offsetWidth / 2 })
  }, [semana, profile])

  return (
    <div>
      <h2 className="mb-3 text-center text-2xl font-bold uppercase">Ajustes</h2>

      <p className="mb-1.5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Quién entrena</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setProfile('yo')} className={`min-h-14 rounded-2xl py-4 text-lg font-bold ${profile === 'yo' ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>{PROFILE_LABEL.yo}</button>
        <button onClick={() => setProfile('novia')} className={`min-h-14 rounded-2xl py-4 text-lg font-bold ${profile === 'novia' ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>{PROFILE_LABEL.novia}</button>
      </div>

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Semana del plan</p>
      <p className="mb-2 text-sm leading-relaxed text-[#7C7C74]">
        {PROFILE_LABEL[profile]} va en la semana <b className="font-display text-base text-[#FCFCFC]">{semana}</b>. El calendario y la rutina arrancan desde ahí.
      </p>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {semanas.map(s => (
          <button key={s} id={`set-sem-${s}`} onClick={() => setSemana(s)}
            className={`font-display h-11 w-11 shrink-0 rounded-2xl text-lg font-semibold ${semana === s ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
            {s}
          </button>
        ))}
      </div>

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Extra al cambiar de ejercicio</p>
      <p className="mb-2 text-sm leading-relaxed text-[#7C7C74]">Se suma al descanso del ejercicio cuando pasas al siguiente.</p>
      <div className="flex items-center justify-between rounded-2xl bg-[#17191d] p-3">
        <button onClick={() => change(-15)} className="font-display h-14 w-14 rounded-2xl bg-[#1f2227] text-2xl font-semibold">−</button>
        <p className="font-display text-3xl font-semibold tabular-nums">{fmt(gap)}</p>
        <button onClick={() => change(15)} className="font-display h-14 w-14 rounded-2xl bg-[#1f2227] text-2xl font-semibold">+</button>
      </div>

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Datos</p>
      <button
        onClick={() => { if (confirm('¿Borrar todos los pesos y checks de este teléfono?')) { clearAll(); location.reload() } }}
        className="min-h-14 w-full rounded-2xl bg-[#1f2227] py-4 text-base font-bold text-red-400"
      >
        Borrar datos de este teléfono
      </button>
      <p className="mt-4 text-center text-sm leading-relaxed text-[#7C7C74]">
        Fase 1 local (sin cuenta).<br />Fotos/videos: los que tú aportes. Videos de ejemplo: YouTube.
      </p>
    </div>
  )
}
