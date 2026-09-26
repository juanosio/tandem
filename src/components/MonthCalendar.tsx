import { useState } from 'react'

// Calendario mensual: marca los días que fuiste a entrenar (punto lima).
// Lunes como primer día de la semana.
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function MonthCalendar({ trained }: { trained: Set<string> }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const first = new Date(ym.y, ym.m, 1)
  const lead = (first.getDay() + 6) % 7 // huecos antes del día 1 (Lun=0)
  const days = new Date(ym.y, ym.m + 1, 0).getDate()
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const today = toStr(now)

  return (
    <div className="rounded-3xl bg-[#17191d]/90 p-4">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setYm(v => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))} className="h-9 w-9 rounded-xl bg-[#1f2227] font-black">‹</button>
        <p className="text-sm font-black">{MESES[ym.m]} {ym.y}</p>
        <button onClick={() => setYm(v => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))} className="h-9 w-9 rounded-xl bg-[#1f2227] font-black">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DOW.map((d, i) => <span key={i} className="py-1 text-[10px] font-bold text-[#7C7C74]">{d}</span>)}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />
          const str = toStr(new Date(ym.y, ym.m, day))
          const was = trained.has(str)
          const isToday = str === today
          return (
            <span key={i} className={`flex flex-col items-center rounded-xl py-1.5 text-xs font-bold ${isToday ? 'bg-[#B2EE37] text-black' : was ? 'text-[#FCFCFC]' : 'text-[#7C7C74]'}`}>
              {day}
              <span className={`mt-0.5 h-1 w-1 rounded-full ${was ? (isToday ? 'bg-black' : 'bg-[#B2EE37]') : 'bg-transparent'}`} />
            </span>
          )
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-[#7C7C74]">● días que entrenaste</p>
    </div>
  )
}
