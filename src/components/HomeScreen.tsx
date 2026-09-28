import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronRight, Dumbbell, Play, Sparkles, Timer, Trophy } from 'lucide-react'
import { getDayExercises } from '../data/semanas'
import { fmtMin, getAvgMs, getMarkedDates, isSetDone, PROFILE_LABEL, todayStr, type Profile } from '../lib/storage'
import { useStorageRev } from '../lib/useStorage'

interface Props {
  profile: Profile
  dia: string
  setDia: (d: string) => void
  onStart: (startIdx: number, dateStr: string, warmup?: boolean) => void
  semana: number
  setSemana: (s: number) => void
  semanas: number[]
}

const WEEK_LINES = [
  'Que hoy marque el inicio de tu increíble transformación',
  'Ya empezaste. Esta semana se trata de repetir y afinar.',
  'El cuerpo ya conoce el camino. Hoy súmale un poco.',
  'Cuatro semanas. Lo difícil ya se está volviendo costumbre.',
  'Vas por la mitad del arranque. La constancia se nota.',
  'Semana de ajuste. Entrena con cabeza, sin apurar.',
  'Ya no estás empezando. Estás construyendo.',
  'Ocho semanas. Confía en lo que ya puedes levantar.',
  'Queda el tramo final del bloque. Cada sesión cuenta.',
  'Diez semanas. La técnica que repetiste ya es tuya.',
  'Casi al cierre. No aflojes justo ahora.',
  'Última semana del plan. Termínala tan bien como empezaste.',
]

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
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function buildStrip(back = 14, forward = 21) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - back)
  return Array.from({ length: back + forward + 1 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const wd = (d.getDay() + 6) % 7
    return { str: toStr(d), num: d.getDate(), wd }
  })
}

// Franja de fechas con hoy al centro: atrás lo que ya pasó, adelante lo que toca.
export default function HomeScreen({ profile, dia, setDia, onStart, semana, setSemana, semanas }: Props) {
  const today = todayStr()
  const [selDate, setSelDate] = useState(today)
  const stripRef = useRef<HTMLDivElement>(null)

  const strip = useMemo(() => buildStrip(), [])
  const thisWeek = useMemo(() => {
    const mon = mondayOfWeek(new Date())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(d.getDate() + i)
      return toStr(d)
    })
  }, [])

  const rev = useStorageRev()
  const trained = useMemo(() => new Set(getMarkedDates(profile)), [profile, rev])
  const weekTrained = thisWeek.filter(s => trained.has(s)).length
  const goal = 5 // Lun-Vie

  const sel = strip.find(w => w.str === selDate) ?? strip.find(w => w.str === today)!
  const selWd = sel.wd
  const selRutinaDia = DIA_BY_WD[selWd]
  const isRest = selRutinaDia === ''
  const activeDia = isRest ? dia : selRutinaDia
  const tone = selDate === today ? 'HOY TOCA' : selDate < today ? 'ASÍ FUE' : 'TE TOCA'

  const list = getDayExercises(semana, activeDia, profile).sort((a, b) => a.orden - b.orden)
  const workTotal = list.reduce((a, e) => a + e.workSets, 0)
  const calentTotal = list.reduce((a, e) => a + e.calentDetalle.length, 0)
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

  useEffect(() => {
    const parent = stripRef.current
    const el = parent?.querySelector<HTMLElement>('[data-today]')
    if (!el || !parent) return
    parent.scrollLeft = el.offsetLeft - parent.clientWidth / 2 + el.offsetWidth / 2
  }, [])

  useEffect(() => {
    const el = document.getElementById(`sem-${semana}`)
    const parent = el?.parentElement
    if (!el || !parent) return
    parent.scrollTo({ left: el.offsetLeft - parent.clientWidth / 2 + el.offsetWidth / 2 })
  }, [semana])

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-[#B2EE37] text-lg font-semibold text-black">
          {profile === 'yo' ? 'J' : 'M'}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#7C7C74]">{saludo()}</p>
          <p className="text-xl font-bold leading-tight">{PROFILE_LABEL[profile]}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-[#B2EE37]/15 px-3 py-1.5 text-xs font-bold text-[#B2EE37]">
          <Dumbbell className="h-3.5 w-3.5" strokeWidth={2.5} />
          GYM
        </div>
      </div>

      <div className="mb-3 rounded-3xl bg-[#17191d]/90 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-base font-bold">Meta semanal</p>
          <p className="font-display flex items-center gap-1 text-base font-semibold text-[#B2EE37]">
            {Math.min(weekTrained, goal)}/{goal}
            <Trophy className="h-4 w-4" strokeWidth={2.25} />
          </p>
        </div>
        <div ref={stripRef} className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {strip.map(w => {
            const isSel = w.str === selDate
            const isToday = w.str === today
            const was = trained.has(w.str)
            return (
              <button key={w.str} data-date={w.str} data-wd={w.wd} data-today={isToday ? '' : undefined} onClick={() => pickDay(w)}
                className={`flex w-[3.25rem] shrink-0 flex-col items-center rounded-2xl py-2 ${isSel ? 'bg-[#FCFCFC] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
                <span className="text-[11px] font-bold">{WD_SHORT[w.wd]}</span>
                <span className={`font-display text-lg font-semibold leading-none ${!isSel && isToday ? 'text-[#B2EE37]' : ''}`}>{w.num}</span>
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${was ? (isSel ? 'bg-black' : 'bg-[#55F670]') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-3 rounded-3xl bg-[#B2EE37]/10 p-4">
        <p className="flex items-start gap-2 text-base font-bold leading-snug">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#B2EE37]" strokeWidth={2.25} />
          {WEEK_LINES[Math.min(WEEK_LINES.length, Math.max(1, semana)) - 1]}
        </p>
        <p className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Semana del plan</p>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {semanas.map(s => (
            <button key={s} id={`sem-${s}`} onClick={() => setSemana(s)}
              className={`font-display h-11 w-11 shrink-0 rounded-2xl text-lg font-semibold ${semana === s ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 rounded-3xl bg-[#17191d]/90 p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#B2EE37]">
            {isRest ? 'Descanso' : `${activeDia} · ${doneCount}/${list.length}`}
          </p>
          {!isRest && <span className="rounded-full bg-[#B2EE37] px-2.5 py-1 text-xs font-bold text-black">S{semana} · {tone}</span>}
        </div>
        <h2 className="text-2xl font-bold leading-tight">
          {isRest ? 'Día de descanso' : `Rutina ${activeDia}`}
        </h2>
        {!isRest && selDate !== today && (
          <p className="mt-0.5 text-sm text-[#7C7C74]">
            {selDate < today ? 'Lo que tocaba ese día, con la semana que tienes puesta.' : 'Lo que te va a tocar, con la semana que tienes puesta.'}
          </p>
        )}
        {!isRest && <p className="mb-2 mt-1 flex items-center gap-1 text-sm text-[#7C7C74]">
          {list.length} ejercicios · {workTotal} sets de trabajo · {calentTotal} calentamiento
          {avg && <><Timer className="ml-1 h-3.5 w-3.5" strokeWidth={2.25} /> {fmtMin(avg)}</>}
        </p>}

        {!isRest && (
          <div className="routine-scroll mb-3 max-h-64 space-y-1 overflow-y-auto pr-2">
            {list.map((e, i) => {
              const done = Array.from({ length: e.workSets }, (_, k) => isSetDone(profile, `${dayKey}:${e.id}:work${k}`)).every(Boolean)
              return (
                <div key={e.id} className="flex min-h-11 w-full items-center gap-2.5 text-left">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${done ? 'bg-[#55F670] text-black' : 'bg-[#23262c] text-[#7C7C74]'}`}>
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="font-display">{i + 1}</span>}
                  </span>
                  <p className={`truncate text-base font-semibold ${done ? 'text-[#55F670] line-through' : 'text-[#FCFCFC]'}`}>
                    {e.nombre} <span className="font-bold text-[#7C7C74]">· {e.workSets}x{e.workReps}</span>
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {isRest ? (
          <p className="rounded-2xl bg-[#1f2227] p-3 text-center text-sm text-[#7C7C74]">Recupera. Mañana se vuelve a entrenar.</p>
        ) : (
          <button
            onClick={() => {
              const reviewing = doneCount === list.length && doneCount > 0
              const idx = firstPending < 0 ? 0 : firstPending
              onStart(idx, selDate, !reviewing && idx === 0)
            }}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#B2EE37] py-4 text-lg font-bold uppercase text-black"
          >
            {doneCount === list.length && doneCount > 0
              ? 'Repasar rutina'
              : firstPending > 0
                ? <>Continuar {firstPending + 1}/{list.length} <ChevronRight className="h-5 w-5" /></>
                : <><Play className="h-5 w-5" fill="currentColor" /> Empezar</>}
          </button>
        )}
      </div>
    </div>
  )
}
