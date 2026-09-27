import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SEMANAS_DISPONIBLES } from '../data/semanas'

// Calendario mensual. Cada fila es una semana del plan (S1, S2…):
// la semana del calendario en la que estás hoy es la semana que tienes puesta.
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const PLAN_MIN = SEMANAS_DISPONIBLES[0]
const PLAN_MAX = SEMANAS_DISPONIBLES[SEMANAS_DISPONIBLES.length - 1]

const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function dayDiff(a: Date, b: Date): number {
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((utc(a) - utc(b)) / 86400000)
}

export default function MonthCalendar({ trained, semana }: { trained: Set<string>; semana: number }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const today = toStr(now)
  const thisMonday = useMemo(() => mondayOf(now), [])

  const weeks = useMemo(() => {
    const last = new Date(ym.y, ym.m + 1, 0)
    const rows: Date[][] = []
    for (let cursor = mondayOf(new Date(ym.y, ym.m, 1)); cursor <= last; cursor = addDays(cursor, 7)) {
      rows.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
    }
    return rows
  }, [ym])

  return (
    <div className="rounded-3xl bg-[#17191d]/90 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setYm(v => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f2227]" aria-label="Mes anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-display text-lg font-semibold">{MESES[ym.m]} {ym.y}</p>
        <button onClick={() => setYm(v => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f2227]" aria-label="Mes siguiente">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-[2.5rem_1fr] gap-1">
        <span />
        <div className="grid grid-cols-7 text-center">
          {DOW.map((d, i) => <span key={i} className="py-1 text-[11px] font-bold text-[#7C7C74]">{d}</span>)}
        </div>
      </div>

      <div className="space-y-1">
        {weeks.map(week => {
          const plan = semana + Math.round(dayDiff(week[0], thisMonday) / 7)
          const inPlan = plan >= PLAN_MIN && plan <= PLAN_MAX
          const current = plan === semana
          return (
            <div
              key={toStr(week[0])}
              className={`grid grid-cols-[2.5rem_1fr] items-center gap-1 rounded-2xl py-0.5 ${current ? 'bg-[#31362f]' : inPlan ? 'bg-[#22262c]' : ''}`}
            >
              <span
                className={`text-center font-display text-sm font-semibold leading-none ${current ? 'text-[#B2EE37]' : inPlan ? 'text-[#b7b7ae]' : 'text-transparent'}`}
                title={inPlan ? (current ? `Semana ${plan}, la que llevas ahora` : `Semana ${plan}`) : undefined}
              >
                {inPlan ? `S${plan}` : ''}
              </span>
              <div className="grid grid-cols-7 text-center">
                {week.map(date => {
                  const str = toStr(date)
                  const inMonth = date.getMonth() === ym.m
                  const was = trained.has(str)
                  const isToday = str === today
                  return (
                    <span
                      key={str}
                      className={`flex flex-col items-center rounded-xl py-1 text-xs font-bold ${isToday ? 'bg-[#B2EE37] text-black' : ''} ${!inMonth && !isToday ? 'opacity-40' : ''}`}
                    >
                      <span className={`font-display text-sm font-semibold ${isToday ? '' : was ? 'text-[#FCFCFC]' : 'text-[#7C7C74]'}`}>{date.getDate()}</span>
                      <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${was ? (isToday ? 'bg-black' : 'bg-[#55F670]') : 'bg-transparent'}`} />
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-[#7C7C74]">
        Cada fila es una semana del plan. La franja más clara es la semana {semana}, la que llevas ahora. El punto verde es un día que entrenaste.
      </p>
    </div>
  )
}
