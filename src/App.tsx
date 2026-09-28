import { useEffect, useMemo, useState } from 'react'
import { descansoMedio } from './types'
import { getDayExercises, SEMANAS_DISPONIBLES } from './data/semanas'
import { Dumbbell } from 'lucide-react'
import { endSession, getLastSession, getRestGap, getWeek, isSetDone, PROFILE_LABEL, setWeek, startSession, todayStr, type Profile } from './lib/storage'
import { restoreSession, signOut } from './lib/auth'
import { isCloudConfigured } from './lib/supabase'
import { startSync } from './lib/sync'
import { useStorageRev } from './lib/useStorage'
import LoginScreen from './components/LoginScreen'
import BottomNav, { type Tab } from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import FinishScreen from './components/FinishScreen'
import HomeScreen from './components/HomeScreen'
import RestDayScreen from './components/RestDayScreen'
import RoutineGate from './components/RoutineGate'
import WarmupScreen from './components/WarmupScreen'
import PlayerScreen from './components/PlayerScreen'
import RestScreen, { beep } from './components/RestScreen'
import ProgressScreen from './components/ProgressScreen'
import SettingsScreen from './components/SettingsScreen'

function isRestToday(): boolean {
  const d = new Date().getDay()
  return d === 0 || d === 6
}

function diaDeHoy(): string {
  const d = new Date().getDay()
  if (d === 1) return 'Lunes'
  if (d === 2) return 'Martes'
  if (d === 3) return 'Miércoles'
  if (d === 4) return 'Jueves'
  if (d === 5) return 'Viernes'
  return 'Lunes'
}

type Slot = {
  tab: Tab
  dia: string
  idx: number
  activeDate: string
  resting: boolean
  restUntil: number | null
  restSecs: number
  finished: boolean
  phase: 'warmup' | 'lift'
  started: boolean
}

function freshSlot(): Slot {
  return {
    tab: 'inicio',
    dia: diaDeHoy(),
    idx: 0,
    activeDate: todayStr(),
    resting: false,
    restUntil: null,
    restSecs: 0,
    finished: false,
    phase: 'lift',
    started: false,
  }
}

export default function App() {
  const cloud = isCloudConfigured()
  const [gate, setGate] = useState<'boot' | 'in' | 'out'>(cloud ? 'boot' : 'in')
  const [sessionWho, setSessionWho] = useState<Profile>('yo')
  const [profile, setProfile] = useState<Profile>('yo')
  const [byProfile, setByProfile] = useState<Record<Profile, Slot>>(() => ({ yo: freshSlot(), novia: freshSlot() }))
  const [semana, setSemana] = useState<number>(() => getWeek('yo'))
  const [routineRev, setRoutineRev] = useState(0)
  const storageRev = useStorageRev()
  const slot = byProfile[profile]

  const list = useMemo(() => getDayExercises(semana, slot.dia, profile), [semana, slot.dia, profile, routineRev, storageRev])
  const ex = list[Math.min(slot.idx, Math.max(0, list.length - 1))]

  const update = (who: Profile, recipe: (cur: Slot) => Slot) => {
    setByProfile(all => ({ ...all, [who]: recipe(all[who]) }))
  }

  const countDone = (who: Profile, date: string, exercises: typeof list) => {
    return exercises.filter(e =>
      Array.from({ length: e.workSets }, (_, i) => isSetDone(who, `${date}:${e.id}:work${i}`)).every(Boolean),
    ).length
  }

  const restDone = (who: Profile = profile) => {
    setByProfile(all => {
      const cur = all[who]
      if (!cur.resting) return all
      const n = getDayExercises(who === profile ? semana : getWeek(who), cur.dia, who).length
      return {
        ...all,
        [who]: { ...cur, resting: false, restUntil: null, idx: Math.min(cur.idx + 1, Math.max(0, n - 1)) },
      }
    })
  }

  useEffect(() => {
    if (!cloud) return
    let cancel = false
    restoreSession().then(who => {
      if (cancel) return
      if (who) {
        setSessionWho(who)
        setProfile(who)
        setSemana(getWeek(who))
        setGate('in')
        startSync()
      } else setGate('out')
    })
    return () => { cancel = true }
  }, [cloud])

  const enter = (who: Profile) => {
    setSessionWho(who)
    setProfile(who)
    setSemana(getWeek(who))
    setGate('in')
    startSync()
  }

  useEffect(() => {
    if (!slot.resting || slot.restUntil == null) return
    const overdue = slot.restUntil <= Date.now()
    const ms = Math.max(0, slot.restUntil - Date.now())
    const t = setTimeout(() => {
      if (!overdue && slot.tab === 'rutina') beep()
      restDone(profile)
    }, ms)
    return () => clearTimeout(t)
  }, [profile, slot.resting, slot.restUntil, slot.tab])

  const ensureSession = (dateStr: string, dia: string) => {
    const open = getLastSession(profile, dateStr)
    if (!open || open.endTs !== null) startSession(profile, dateStr, dia, list.length)
  }
  const startAt = (i: number, dateStr: string, warmup = false) => {
    if (!warmup) ensureSession(dateStr, slot.dia)
    update(profile, cur => ({
      ...cur,
      activeDate: dateStr,
      idx: i,
      finished: false,
      resting: false,
      restUntil: null,
      tab: 'rutina',
      phase: warmup ? 'warmup' : 'lift',
      started: true,
    }))
  }
  const beginLifting = () => {
    ensureSession(slot.activeDate, slot.dia)
    update(profile, cur => ({ ...cur, phase: 'lift', started: true }))
  }
  const changeDia = (d: string) => update(profile, cur => ({ ...cur, dia: d, idx: 0, finished: false, resting: false, restUntil: null, started: false, phase: 'lift' }))
  const changeProfile = (p: Profile) => {
    setProfile(p)
    setSemana(getWeek(p))
  }
  const changeSemana = (s: number) => {
    setSemana(s)
    setWeek(profile, s)
    update(profile, cur => ({ ...cur, idx: 0, finished: false, resting: false, restUntil: null, started: false, phase: 'lift' }))
  }

  const completeExercise = () => {
    if (slot.idx >= list.length - 1) {
      endSession(profile, slot.activeDate, countDone(profile, slot.activeDate, list), list.length)
      update(profile, cur => ({ ...cur, finished: true, resting: false, restUntil: null }))
      return
    }
    const secs = descansoMedio(list[slot.idx]?.descanso, 90) + getRestGap()
    update(profile, cur => ({ ...cur, resting: true, restSecs: secs, restUntil: Date.now() + secs * 1000 }))
  }

  const addRest = (secs: number) => {
    update(profile, cur => ({
      ...cur,
      restSecs: cur.restSecs + secs,
      restUntil: (cur.restUntil ?? Date.now()) + secs * 1000,
    }))
  }

  if (gate === 'boot') {
    return (
      <div className="grid min-h-full place-items-center bg-[#0F1012] text-[#FCFCFC]">
        <p className="text-4xl font-bold">Tándem</p>
      </div>
    )
  }
  if (gate === 'out') return <LoginScreen onSuccess={enter} />

  return (
    <div className="min-h-full bg-[#0F1012] text-[#FCFCFC]">
      <div className="glow left-[-80px] top-[-60px] h-72 w-72 bg-[#B2EE37]/15" />
      <div className="glow right-[-100px] top-[35%] h-80 w-80 bg-[#55F670]/10" />
      <div className="glow bottom-[-80px] left-[20%] h-72 w-72 bg-[#B2EE37]/10" />
      <div className="relative z-10 mx-auto max-w-xl px-3 pb-28 pt-3">
        <header className="mb-3 flex items-center justify-between gap-2">
          <h1 className="flex shrink-0 items-center gap-1.5 text-xl font-bold tracking-tight">
            <Dumbbell className="h-5 w-5 text-[#B2EE37]" strokeWidth={2.5} />
            Tándem
          </h1>
          <div className="flex rounded-2xl bg-[#1f2227] p-1 text-base font-black">
            {(['yo', 'novia'] as const).map(p => (
              <button key={p} onClick={() => changeProfile(p)}
                className={`min-h-11 rounded-xl px-3.5 ${profile === p ? 'bg-[#B2EE37] text-black' : 'text-[#7C7C74]'}`}>
                {PROFILE_LABEL[p]}
              </button>
            ))}
          </div>
        </header>

        <ErrorBoundary key={`${slot.tab}-${profile}`}>
        {slot.tab === 'inicio' && (
          <HomeScreen
            profile={profile} dia={slot.dia} setDia={changeDia} onStart={startAt}
            semana={semana} setSemana={changeSemana} semanas={SEMANAS_DISPONIBLES}
          />
        )}

        {slot.tab === 'rutina' && (
          slot.started ? null :
          isRestToday() ? <RestDayScreen /> :
          <RoutineGate onHome={() => update(profile, cur => ({ ...cur, tab: 'inicio' }))} />
        )}
        {slot.tab === 'rutina' && slot.started && (
          <>
            {slot.finished ? (
              <FinishScreen
                profile={profile}
                dia={slot.dia}
                date={slot.activeDate}
                list={list}
                onHome={() => update(profile, cur => ({ ...cur, tab: 'inicio', finished: false, idx: 0, phase: 'lift', started: false }))}
                onProgress={() => update(profile, cur => ({ ...cur, tab: 'progreso', phase: 'lift' }))}
              />
            ) : slot.phase === 'warmup' ? (
              <WarmupScreen profile={profile} onDone={beginLifting} />
            ) : slot.resting && slot.restUntil != null ? (
              <RestScreen
                profile={profile}
                date={slot.activeDate}
                until={slot.restUntil}
                totalSecs={slot.restSecs}
                hint={list[slot.idx]?.descanso ?? null}
                nextEx={slot.idx + 1 < list.length ? list[slot.idx + 1] : null}
                nextName={slot.idx + 1 < list.length ? list[slot.idx + 1].nombre : null}
                onSkip={() => restDone(profile)}
                extraSecs={getRestGap()}
                onAdd={addRest}
                remaining={{ done: slot.idx + 1, total: list.length }}
              />
            ) : ex ? (
              <PlayerScreen
                key={`${profile}-${ex.id}-${ex.mediaKey ?? ''}`}
                ex={ex}
                profile={profile}
                date={slot.activeDate}
                index={slot.idx}
                total={list.length}
                isLast={slot.idx >= list.length - 1}
                onPrev={() => update(profile, cur => ({ ...cur, idx: Math.max(0, cur.idx - 1) }))}
                onComplete={completeExercise}
                semana={semana}
              />
            ) : null}
          </>
        )}

        {slot.tab === 'progreso' && (
          <ProgressScreen profile={profile} dia={slot.dia} setDia={changeDia} semana={semana} />
        )}
        {slot.tab === 'ajustes' && (
          <SettingsScreen
            profile={profile} setProfile={changeProfile}
            semana={semana} setSemana={changeSemana} semanas={SEMANAS_DISPONIBLES}
            onRoutineChange={() => setRoutineRev(n => n + 1)}
            session={sessionWho}
            onLogout={cloud ? async () => { await signOut(); setGate('out') } : undefined}
          />
        )}
        </ErrorBoundary>

      </div>
      <BottomNav tab={slot.tab} setTab={t => update(profile, cur => ({ ...cur, tab: t }))} />
    </div>
  )
}
