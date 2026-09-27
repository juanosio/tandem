import { useState } from 'react'
import { DIAS } from '../types'
import { getYoDayExercises } from '../data/semanas'
import { getNoviaDayExercises } from '../data/semanasNovia'
import { getPrincipal, setPrincipal, type Profile } from '../lib/storage'
import { slotKey, variantKey } from '../lib/routine'

export default function RoutineEditor({
  profile, semana, onChange,
}: {
  profile: Profile
  semana: number
  onChange: () => void
}) {
  const [dia, setDia] = useState<(typeof DIAS)[number]>('Lunes')
  const [, bump] = useState(0)
  const list = (profile === 'novia' ? getNoviaDayExercises(semana, dia) : getYoDayExercises(semana, dia))
    .slice()
    .sort((a, b) => a.orden - b.orden)

  const pick = (slot: string, key: string) => {
    setPrincipal(profile, slot, key)
    bump(n => n + 1)
    onChange()
  }

  return (
    <div className="mt-5">
      <p className="mb-1.5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Ejercicios de tu gym</p>
      <p className="mb-3 text-sm leading-relaxed text-[#7C7C74]">
        Si una máquina no está, elige otra como principal. El peso de cada variante se guarda aparte: si vuelves a la del plan, reaparecen sus kilos.
      </p>
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {DIAS.map(d => (
          <button key={d} onClick={() => setDia(d)}
            className={`min-h-11 rounded-2xl text-sm font-bold ${dia === d ? 'bg-[#FCFCFC] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
            {d.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map(ex => {
          const slot = slotKey(ex)
          const options = [
            { key: slot, es: ex.nombre, tag: 'Del plan' },
            ...(ex.alts ?? []).map(a => ({ key: variantKey(a), es: a.es, tag: 'Alternativa' })),
          ]
          const stored = getPrincipal(profile, slot)
          const chosen = stored && options.some(o => o.key === stored) ? stored : slot
          const active = options.find(o => o.key === chosen) ?? options[0]
          return (
            <div key={ex.id} className="rounded-3xl bg-[#17191d] p-3">
              <p className="text-base font-bold leading-snug">{active.es}</p>
              {active.key !== slot && (
                <p className="text-sm text-[#7C7C74]">En el plan era {ex.nombre}</p>
              )}
              {options.length === 1 ? (
                <p className="mt-1 text-sm text-[#7C7C74]">Sin alternativa cargada.</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {options.map(o => (
                    <button key={o.key} onClick={() => pick(slot, o.key)}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold ${o.key === chosen ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227] text-[#FCFCFC]'}`}>
                      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide opacity-70">{o.tag}</span>
                      <span className="min-w-0">{o.es}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
