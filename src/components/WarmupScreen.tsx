import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { warmupFor, type WarmItem } from '../data/warmup'
import type { Profile } from '../lib/storage'

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function ItemRow({ item, on, toggle }: { item: WarmItem; on: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} className="flex w-full items-start gap-3 py-2 text-left">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${on ? 'border-[#B2EE37] bg-[#B2EE37] text-black' : 'border-[#3a3d43] text-transparent'}`}>
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className={`block text-base font-semibold ${on ? 'text-[#55F670]' : ''}`}>{item.nombre}</span>
        <span className="block text-sm text-[#7C7C74]">
          {item.reps}{item.nota ? ` · ${item.nota}` : ''}
        </span>
      </span>
    </button>
  )
}

export default function WarmupScreen({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const plan = warmupFor(profile)
  const [machine, setMachine] = useState(plan.maquinaInicial)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    if (left == null || left <= 0) return
    const t = setTimeout(() => setLeft(s => (s == null ? s : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [left])

  const toggle = (id: string) => setChecked(all => ({ ...all, [id]: !all[id] }))

  return (
    <div>
      <p className="text-center text-sm font-bold uppercase tracking-wider text-[#B2EE37]">Antes de las pesas</p>
      <h2 className="mb-1 text-center text-3xl font-bold">{plan.titulo}</h2>
      <p className="mb-4 text-center text-sm leading-relaxed text-[#7C7C74]">{plan.intro}</p>

      <div className="space-y-3">
        {plan.pasos.map((paso, i) => (
          <section key={paso.id} className="rounded-3xl bg-[#17191d]/90 p-4">
            <p className="font-display text-sm font-semibold text-[#B2EE37]">Paso {i + 1}</p>
            <h3 className="text-xl font-bold">{paso.titulo}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#FCFCFC]">{paso.detalle}</p>
            {paso.aviso && (
              <p className="mt-2 rounded-2xl bg-[#1f2227] p-3 text-sm leading-relaxed text-[#FCFCFC]">{paso.aviso}</p>
            )}
            {paso.maquinas && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {paso.maquinas.map(m => (
                  <button key={m} onClick={() => setMachine(m)}
                    className={`min-h-11 rounded-2xl px-3 text-sm font-bold ${machine === m ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227] text-[#FCFCFC]'}`}>
                    {m}
                  </button>
                ))}
              </div>
            )}
            {paso.id === 'cardio' && (
              <div className="mt-3 flex items-center gap-2">
                {left == null ? (
                  <>
                    <button onClick={() => setLeft(5 * 60)} className="min-h-11 flex-1 rounded-2xl bg-[#1f2227] text-sm font-bold">5 min</button>
                    <button onClick={() => setLeft(10 * 60)} className="min-h-11 flex-1 rounded-2xl bg-[#1f2227] text-sm font-bold">10 min</button>
                  </>
                ) : (
                  <>
                    <p className="font-display flex-1 text-center text-3xl font-semibold tabular-nums">{left <= 0 ? 'Listo' : fmt(left)}</p>
                    <button onClick={() => setLeft(null)} className="min-h-11 rounded-2xl bg-[#1f2227] px-4 text-sm font-bold">Parar</button>
                  </>
                )}
              </div>
            )}
            {paso.items && (
              <div className="mt-2 divide-y divide-[#23262c]">
                {paso.items.map(item => (
                  <ItemRow key={item.id} item={item} on={!!checked[item.id]} toggle={() => toggle(item.id)} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-[#7C7C74]">Los videos de estos movimientos entran cuando los tengas. Hoy basta con hacerlos.</p>

      <button onClick={onDone} className="mt-4 min-h-14 w-full rounded-2xl bg-[#B2EE37] py-4 text-lg font-bold uppercase text-black">
        A las pesas
      </button>
      <button onClick={onDone} className="mt-2 min-h-12 w-full rounded-2xl py-3 text-sm font-bold text-[#7C7C74]">
        Saltar calentamiento
      </button>
    </div>
  )
}
