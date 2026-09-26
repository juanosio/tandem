import { useState } from 'react'
import { clearAll, getRestSecs, setRestSecs, type Profile } from '../lib/storage'

export default function SettingsScreen({ profile, setProfile }: { profile: Profile; setProfile: (p: Profile) => void }) {
  const [rest, setRest] = useState(() => getRestSecs())
  const change = (d: number) => {
    const v = Math.min(300, Math.max(15, rest + d))
    setRest(v); setRestSecs(v)
  }
  return (
    <div>
      <h2 className="mb-3 text-center text-xl font-black uppercase">Ajustes</h2>

      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Perfil (pesos separados)</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setProfile('yo')} className={`rounded-2xl py-3.5 text-sm font-black ${profile === 'yo' ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>Yo</button>
        <button onClick={() => setProfile('novia')} className={`rounded-2xl py-3.5 text-sm font-black ${profile === 'novia' ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>Novia</button>
      </div>

      <p className="mb-1.5 mt-5 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Descanso entre ejercicios</p>
      <div className="flex items-center justify-between rounded-2xl bg-[#17191d] p-3">
        <button onClick={() => change(-15)} className="h-11 w-11 rounded-xl bg-[#1f2227] text-xl font-black">−</button>
        <p className="text-2xl font-black tabular-nums">{Math.floor(rest / 60)}:{String(rest % 60).padStart(2, '0')}</p>
        <button onClick={() => change(15)} className="h-11 w-11 rounded-xl bg-[#1f2227] text-xl font-black">+</button>
      </div>

      <p className="mb-1.5 mt-5 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Datos</p>
      <button
        onClick={() => { if (confirm('¿Borrar todos los pesos y checks de este teléfono?')) { clearAll(); location.reload() } }}
        className="w-full rounded-2xl bg-[#1f2227] py-3.5 text-sm font-bold text-red-400"
      >
        Borrar datos de este teléfono
      </button>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-[#7C7C74]">
        Fase 1 local (sin cuenta).<br />Fotos/videos: los que tú aportes. Videos de ejemplo: YouTube.
      </p>
    </div>
  )
}
