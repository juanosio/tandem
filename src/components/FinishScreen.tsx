import { useMemo } from 'react'
import { Flame, PartyPopper, Timer, TrendingUp } from 'lucide-react'
import type { Exercise } from '../types'
import {
  getFinishedDates,
  getHistory,
  getLastSession,
  isSetDone,
  type Profile,
} from '../lib/storage'

const fmtDur = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`
}

interface PR { nombre: string; antes: number; ahora: number }

// Resumen al terminar: tiempo total (contador detenido), ejercicios/sets hechos y PRs.
export default function FinishScreen({
  profile, dia, date, list, onHome, onProgress,
}: {
  profile: Profile
  dia: string
  date: string
  list: Exercise[]
  onHome: () => void
  onProgress: () => void
}) {

  const summary = useMemo(() => {
    const doneEx = list.filter(e =>
      Array.from({ length: e.workSets }, (_, i) => isSetDone(profile, `${date}:${e.id}:work${i}`)).every(Boolean),
    )
    const setsDone = list.reduce((a, e) =>
      a + Array.from({ length: e.workSets }, (_, i) => i).filter(i => isSetDone(profile, `${date}:${e.id}:work${i}`)).length, 0)
    const setsTotal = list.reduce((a, e) => a + e.workSets, 0)

    const prs: PR[] = []
    for (const e of list) {
      const h = getHistory(profile, e.mediaKey ?? e.id)
      const prev = h.filter(x => x.date < date).map(x => x.peso)
      const todayMax = Math.max(0, ...h.filter(x => x.date === date).map(x => x.peso))
      if (prev.length > 0 && todayMax > Math.max(...prev)) {
        prs.push({ nombre: e.nombre, antes: Math.max(...prev), ahora: todayMax })
      }
    }

    const start = getLastSession(profile, date)?.startTs ?? Date.now()
    const end = getLastSession(profile, date)?.endTs ?? Date.now()
    const weekCount = getFinishedDates(profile).filter(t => {
      const d = new Date()
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      const mon = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return t >= mon
    }).length

    return { doneEx: doneEx.length, setsDone, setsTotal, prs, ms: start ? end - start : 0, weekCount }
  }, [profile, dia, list, date])

  return (
    <div className="flex min-h-[55vh] flex-col items-center text-center">
      <PartyPopper className="h-14 w-14 text-[#B2EE37]" strokeWidth={1.75} />
      <h2 className="mt-2 text-2xl font-bold uppercase">Rutina completada</h2>
      <p className="mt-1 text-sm text-[#7C7C74]">{dia} · {list.length} ejercicios · buen trabajo</p>

      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        <div className="rounded-3xl bg-[#17191d] p-3">
          <p className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-[#7C7C74]">
            <Timer className="h-3.5 w-3.5" /> Tiempo
          </p>
          <p className="font-display text-lg font-semibold tabular-nums text-[#B2EE37]">{fmtDur(summary.ms)}</p>
        </div>
        <div className="rounded-3xl bg-[#17191d] p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Ejercicios</p>
          <p className="font-display text-lg font-semibold">{summary.doneEx}/{list.length}</p>
        </div>
        <div className="rounded-3xl bg-[#17191d] p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Sets</p>
          <p className="font-display text-lg font-semibold">{summary.setsDone}/{summary.setsTotal}</p>
        </div>
      </div>

      {summary.prs.length > 0 ? (
        <div className="mt-3 w-full rounded-3xl border border-[#55F670]/30 bg-[#55F670]/10 p-3.5 text-left">
          <p className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#55F670]">
            <Flame className="h-3.5 w-3.5" /> Récords de hoy
          </p>
          {summary.prs.map(p => (
            <p key={p.nombre} className="truncate text-sm">
              <b>{p.nombre}</b>: <span className="text-[#7C7C74] line-through">{p.antes}kg</span> → <b className="text-[#55F670]">{p.ahora}kg</b>
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-3 w-full rounded-3xl bg-[#17191d] p-3 text-xs text-[#7C7C74]">
          Sin récords hoy, y sumaste 1 día más a tu semana ({summary.weekCount}/5). La constancia es la progresión.
        </p>
      )}

      <button onClick={onHome} className="mt-4 w-full rounded-2xl bg-[#B2EE37] py-4 text-base font-black uppercase text-black">
        Volver al inicio
      </button>
      <button onClick={onProgress} className="mt-2 w-full rounded-2xl bg-[#1f2227] py-3.5 text-sm font-bold">
        <span className="inline-flex items-center justify-center gap-1.5"><TrendingUp className="h-4 w-4" /> Ver progresión</span>
      </button>
    </div>
  )
}
