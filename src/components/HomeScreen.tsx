import { useMemo, useState } from 'react'
import { getDayExercises } from '../data/semanas'
import { fmtMin, getAvgMs, getFinishedDates, isSetDone, todayStr, type Profile } from '../lib/storage'

interface Props {
  profile: Profile
  dia: string
  setDia: (d: string) => void
  onStart: (startIdx: number, dateStr: string) => void
  semana: number
  setSemana: (s: number) => void
  semanas: number[]
}

const WD_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIA_BY_WD = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', '', ''] // sáb/dom = descanso

const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function mondayOfWeek(base: Date): Date {
  const d = new Date(base)
  const shift = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - shift)
  d.setHours(0, 0, 0, 0)
  return d
}

function saludo(): string {
  const h = new Date().getHours()
  if (h < 12) return '¡Buenos días!'
  if (h < 20) return '¡Buenas tardes!'
  return '¡Buenas noches!'
}

// Dashboard estilo referencia: saludo, meta semanal con píldoras Lun-Dom,
// tarjeta de la rutina, empezar/continuar, focos musculares y calendario.
export default function HomeScreen({ profile, dia, setDia, onStart, semana, setSemana, semanas }: Props) {
  const today = todayStr()
  const [selDate, setSelDate] = useState(today)

  const week = useMemo(() => {
    const mon = mondayOfWeek(new Date())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(d.getDate() + i)
      return { str: toStr(d), num: d.getDate(), wd: i }
    })
  }, [])

  const trained = useMemo(() => new Set(getFinishedDates(profile)), [profile])
  const weekTrained = week.filter(w => trained.has(w.str)).length
  const goal = 5 // Lun-Vie

  const selWd = week.find(w => w.str === selDate)?.wd ?? ((new Date().getDay() + 6) % 7)
  const selRutinaDia = DIA_BY_WD[selWd]
  const isRest = selRutinaDia === ''
  const activeDia = isRest ? dia : selRutinaDia

  const list = getDayExercises(semana, activeDia).sort((a, b) => a.orden - b.orden)
  const workTotal = list.reduce((a, e) => a + e.workSets, 0)
  const calentTotal = list.reduce((a, e) => a + e.calentDetalle.length, 0)
  // Estimado según tu promedio en este día de rutina (referencia, de tus sesiones pasadas).
  const avg = isRest ? null : getAvgMs(profile, activeDia)
  const dayKey = isRest ? today : selDate
  const doneCount = isRest ? 0 : list.filter(e =>
    Array.from({ length: e.workSets }, (_, i) => isSetDone(profile, `${dayKey}:${e.id}:work${i}`)).every(Boolean),
  ).length
  const firstPending = isRest ? -1 : list.findIndex(e =>
    !Array.from({ length: e.workSets }, (_, i) => isSetDone(profile, `${dayKey}:${e.id}:work${i}`)).every(Boolean),
  )

  const pickDay = (w: { str: string; wd: number }) => {
    setSelDate(w.str)
    if (DIA_BY_WD[w.wd] !== '') setDia(DIA_BY_WD[w.wd])
  }

  return (
    <div>
      {/* Saludo */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B2EE37] text-xl font-black text-black">
          {profile === 'yo' ? '💪' : '🔥'}
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-[#7C7C74]">{saludo()}</p>
          <p className="text-lg font-black leading-tight">{profile === 'yo' ? 'Mi rutina' : 'Rutina de ella'}</p>
        </div>
        <div className="rounded-2xl bg-[#B2EE37]/15 px-3 py-1.5 text-xs font-black text-[#B2EE37]">🏋️ GYM</div>
      </div>

      {/* Meta semanal */}
      <div className="mb-3 rounded-3xl bg-[#17191d]/90 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-black">Meta semanal</p>
          <p className="text-sm font-black text-[#B2EE37]">{Math.min(weekTrained, goal)}/{goal} 🏋️</p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {week.map(w => {
            const isSel = w.str === selDate
            const isToday = w.str === today
            const was = trained.has(w.str)
            return (
              <button key={w.str} onClick={() => pickDay(w)}
                className={`flex flex-col items-center rounded-2xl py-2 ${isSel ? 'bg-[#FCFCFC] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
                <span className="text-[10px] font-bold">{WD_SHORT[w.wd]}</span>
                <span className={`text-sm font-black ${!isSel && isToday ? 'text-[#B2EE37]' : ''}`}>{w.num}</span>
                {was && <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSel ? 'bg-black' : 'bg-[#55F670]'}`} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tarjeta motivación */}
      <div className="mb-3 flex items-center justify-between gap-2 rounded-3xl bg-[#B2EE37]/10 p-4">
        <p className="flex-1 text-sm font-bold leading-snug">Que hoy marque el inicio de tu increíble transformación 💪</p>
        <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-[#1f2227] p-1">
          <span className="pl-2 text-[10px] font-black uppercase text-[#7C7C74]">Sem</span>
          {semanas.map(s => (
            <button key={s} onClick={() => setSemana(s)}
              className={`h-8 w-8 rounded-xl text-sm font-black ${semana === s ? 'bg-[#B2EE37] text-black' : 'text-[#7C7C74]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Rutina del día seleccionado */}
      <div className="mb-3 rounded-3xl bg-[#17191d]/90 p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#B2EE37]">
            {isRest ? 'Descanso 😴' : `${activeDia} · ${doneCount}/${list.length}`}
          </p>
          {!isRest && <span className="rounded-full bg-[#B2EE37] px-2.5 py-0.5 text-[10px] font-black text-black">S{semana} · HOY TOCA</span>}
        </div>
        <h2 className="text-xl font-black leading-tight">
          {isRest ? 'Día de descanso' : `Rutina ${activeDia}`}
        </h2>
        {!isRest && <p className="mb-2 text-xs text-[#7C7C74]">
          {list.length} ejercicios · {workTotal} sets de trabajo · {calentTotal} calentamiento{avg ? ` · ⏱ ${fmtMin(avg)}` : ''}
        </p>}

        {!isRest && (
          <div className="mb-3 max-h-64 space-y-1 overflow-y-auto pr-1">
            {list.map((e, i) => {
              const done = Array.from({ length: e.workSets }, (_, k) => isSetDone(profile, `${dayKey}:${e.id}:work${k}`)).every(Boolean)
              return (
                <button key={e.id} onClick={() => onStart(i, dayKey)} className="flex w-full items-center gap-2 text-left">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${done ? 'bg-[#55F670] text-black' : 'bg-[#23262c] text-[#7C7C74]'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <p className={`truncate text-xs ${done ? 'text-[#55F670] line-through' : 'text-[#7C7C74]'}`}>
                    {e.nombre} <span className="text-[#3a3d43]">· {e.workSets}x{e.workReps}</span>
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {isRest ? (
          <p className="rounded-2xl bg-[#1f2227] p-3 text-center text-xs text-[#7C7C74]">Recupera. Vuelve mañana a darle con todo 🔋</p>
        ) : (
          <button
            onClick={() => onStart(firstPending === -1 ? 0 : firstPending, selDate)}
            className="w-full rounded-2xl bg-[#B2EE37] py-4 text-base font-black uppercase text-black"
          >
            {selDate === today && doneCount === list.length ? 'Repasar rutina' : firstPending > 0 ? `Continuar ${firstPending + 1}/${list.length} ›` : '▶ Empezar'}
          </button>
        )}
      </div>
    </div>
  )
}
