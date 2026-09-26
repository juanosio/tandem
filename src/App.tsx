import { useMemo, useState } from 'react'
import { DIAS, descansoMedio } from './types'
import { getDayExercises, SEMANAS_DISPONIBLES } from './data/semanas'
import { endSession, getRestSecs, getWeek, isSetDone, setWeek, startSession, todayStr, type Profile } from './lib/storage'
import BottomNav, { type Tab } from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import FinishScreen from './components/FinishScreen'
import HomeScreen from './components/HomeScreen'
import PlayerScreen from './components/PlayerScreen'
import RestScreen from './components/RestScreen'
import ProgressScreen from './components/ProgressScreen'
import SettingsScreen from './components/SettingsScreen'

function diaDeHoy(): string {
  const d = new Date().getDay()
  if (d === 1) return 'Lunes'
  if (d === 2) return 'Martes'
  if (d === 3) return 'Miércoles'
  if (d === 4) return 'Jueves'
  if (d === 5) return 'Viernes'
  return 'Lunes'
}

export default function App() {
  const [tab, setTab] = useState<Tab>('inicio')
  const [profile, setProfile] = useState<Profile>('yo')
  const [dia, setDia] = useState<string>(() => diaDeHoy())
  const [idx, setIdx] = useState(0)
  const [activeDate, setActiveDate] = useState<string>(() => todayStr()) // día que se está registrando (puede ser otro que hoy)
  const [resting, setResting] = useState(false) // fase descanso entre ejercicios
  const [restKey, setRestKey] = useState(0) // reinicia el timer cada vez
  const [finished, setFinished] = useState(false)
  const [semana, setSemana] = useState<number>(() => getWeek())

  const list = useMemo(() => getDayExercises(semana, dia), [semana, dia])
  const ex = list[Math.min(idx, list.length - 1)]

  const countDoneToday = () => {
    return list.filter(e =>
      Array.from({ length: e.workSets }, (_, i) => isSetDone(profile, `${activeDate}:${e.id}:work${i}`)).every(Boolean),
    ).length
  }

  const startAt = (i: number, dateStr: string) => {
    setActiveDate(dateStr)
    startSession(profile, dateStr, dia, list.length) // nueva sesión en el día elegido: contador desde 0
    setIdx(i); setFinished(false); setResting(false); setTab('rutina')
  }
  const changeDia = (d: string) => { setDia(d); setIdx(0); setFinished(false); setResting(false) }
  const changeSemana = (s: number) => { setSemana(s); setWeek(s); setIdx(0); setFinished(false); setResting(false) }

  // Completar ejercicio -> descanso (o fin si era el último: cierra la sesión y detiene el contador)
  const completeExercise = () => {
    if (idx >= list.length - 1) {
      endSession(profile, activeDate, countDoneToday(), list.length)
      setFinished(true)
      return
    }
    setResting(true); setRestKey(k => k + 1)
  }
  // Termina el descanso -> siguiente ejercicio
  const restDone = () => {
    setResting(false)
    setIdx(i => Math.min(i + 1, list.length - 1))
  }

  return (
    <div className="min-h-full bg-[#0F1012] text-[#FCFCFC]">
      {/* Glows difuminados de fondo estilo referencia */}
      <div className="glow left-[-80px] top-[-60px] h-72 w-72 bg-[#B2EE37]/15" />
      <div className="glow right-[-100px] top-[35%] h-80 w-80 bg-[#55F670]/10" />
      <div className="glow bottom-[-80px] left-[20%] h-72 w-72 bg-[#B2EE37]/10" />
      <div className="relative z-10 mx-auto max-w-xl px-3 pb-24 pt-3">
        {/* Header */}
        <header className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-black">🏋️ GymApp</h1>
          <div className="flex rounded-2xl bg-[#1f2227] p-1 text-sm font-black">
            <button onClick={() => setProfile('yo')} className={`rounded-xl px-4 py-1.5 ${profile === 'yo' ? 'bg-[#B2EE37] text-black' : 'text-[#7C7C74]'}`}>Yo</button>
            <button onClick={() => setProfile('novia')} className={`rounded-xl px-4 py-1.5 ${profile === 'novia' ? 'bg-[#B2EE37] text-black' : 'text-[#7C7C74]'}`}>Novia</button>
          </div>
        </header>

        {/* Un solo boundary con key estable: dia/idx NO remontan (rompía las píldoras) */}
        <ErrorBoundary key={`${tab}-${profile}`}>
        {tab === 'inicio' && (
          <HomeScreen
            profile={profile} dia={dia} setDia={changeDia} onStart={startAt}
            semana={semana} setSemana={changeSemana} semanas={SEMANAS_DISPONIBLES}
          />
        )}

        {tab === 'rutina' && (
          <>
            {finished ? (
              <FinishScreen
                profile={profile}
                dia={dia}
                date={activeDate}
                list={list}
                onHome={() => { setTab('inicio'); setFinished(false); setIdx(0) }}
                onProgress={() => setTab('progreso')}
              />
            ) : resting ? (
              <RestScreen
                key={`${restKey}-${idx}`}
                profile={profile}
                date={activeDate}
                seconds={descansoMedio(list[idx]?.descanso, getRestSecs())}
                hint={list[idx]?.descanso ?? null}
                nextName={list[Math.min(idx + 1, list.length - 1)]?.nombre ?? null}
                onSkip={restDone}
                onDone={restDone}
                remaining={{ done: idx + 1, total: list.length }}
              />
            ) : ex ? (
              <PlayerScreen
                key={`${profile}-${ex.id}`}
                ex={ex}
                profile={profile}
                date={activeDate}
                index={idx}
                total={list.length}
                isLast={idx >= list.length - 1}
                onPrev={() => setIdx(i => Math.max(0, i - 1))}
                onComplete={completeExercise}
              />
            ) : null}
          </>
        )}

        {tab === 'progreso' && <ProgressScreen profile={profile} dia={dia} semana={semana} />}
        {tab === 'ajustes' && <SettingsScreen profile={profile} setProfile={setProfile} />}
        </ErrorBoundary>

        {tab !== 'inicio' && tab !== 'rutina' && (
          <div className="mb-3 flex gap-1.5 overflow-x-auto">
            {DIAS.map(d => (
              <button key={d} onClick={() => changeDia(d)}
                className={`shrink-0 rounded-2xl px-3.5 py-2 text-xs font-bold ${dia === d ? 'bg-[#FCFCFC] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav tab={tab} setTab={t => { setTab(t); setResting(false) }} />
    </div>
  )
}
