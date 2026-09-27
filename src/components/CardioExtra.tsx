import { useEffect, useState } from 'react'
import { getCardioPref, setCardioPref } from '../lib/storage'

const MAQUINAS = ['Caminadora', 'Elíptica', 'Bicicleta', 'Escaladora']
const MINUTOS = [10, 15, 20, 30]

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function CardioExtra() {
  const saved = getCardioPref()
  const [machine, setMachine] = useState(saved.machine)
  const [mins, setMins] = useState(saved.mins)
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    if (left == null || left <= 0) return
    const t = setTimeout(() => setLeft(s => (s == null ? s : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [left])

  const chooseMachine = (m: string) => {
    setMachine(m)
    setCardioPref({ machine: m, mins })
  }
  const chooseMins = (n: number) => {
    setMins(n)
    setCardioPref({ machine, mins: n })
    if (left != null) setLeft(n * 60)
  }

  return (
    <div className="mt-3 w-full rounded-3xl bg-[#17191d] p-4 text-left">
      <p className="text-xs font-bold uppercase tracking-wider text-[#B2EE37]">Opcional · solo Juan</p>
      <h3 className="text-xl font-bold">Cardio extra</h3>
      <p className="mt-1 text-sm leading-relaxed text-[#FCFCFC]">
        Mejor ahora, después de las pesas. La energía principal ya se usó en el músculo y esto queda como extra para bajar grasa.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {MAQUINAS.map(m => (
          <button key={m} onClick={() => chooseMachine(m)}
            className={`min-h-11 rounded-2xl px-3 text-sm font-bold ${machine === m ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>
            {m}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {MINUTOS.map(n => (
          <button key={n} onClick={() => chooseMins(n)}
            className={`font-display min-h-11 rounded-2xl text-lg font-semibold ${mins === n ? 'bg-[#FCFCFC] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-[#7C7C74]">minutos</p>
      {left == null ? (
        <button onClick={() => setLeft(mins * 60)} className="mt-3 min-h-12 w-full rounded-2xl bg-[#1f2227] text-base font-bold">
          Empezar {mins} min
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <p className="font-display flex-1 text-center text-4xl font-semibold tabular-nums">{left <= 0 ? 'Listo' : fmt(left)}</p>
          <button onClick={() => setLeft(null)} className="min-h-12 rounded-2xl bg-[#1f2227] px-4 text-sm font-bold">Cerrar</button>
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-[#7C7C74]">
        Si semana a semana pierdes fuerza, estás agotado todo el tiempo o las sesiones se arrastran, recorta los días o los minutos. El cardio de más estorba la recuperación.
      </p>
    </div>
  )
}
