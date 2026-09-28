import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { clearProfile, exportBackup, getBody, getRestGap, importBackup, PROFILE_LABEL, readTrash, restoreTrash, setBody, setRestGap, type Profile } from '../lib/storage'
import { useStorageRev } from '../lib/useStorage'
import { isCloudConfigured } from '../lib/supabase'
import { subscribeSync, syncStatus } from '../lib/sync'
import RoutineEditor from './RoutineEditor'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function SettingsScreen({
  profile, setProfile, semana, setSemana, semanas, onRoutineChange, session, onLogout,
}: {
  profile: Profile
  setProfile: (p: Profile) => void
  semana: number
  setSemana: (s: number) => void
  semanas: number[]
  onRoutineChange: () => void
  session?: Profile
  onLogout?: () => void
}) {
  const cloud = isCloudConfigured()
  useStorageRev()
  const trash = readTrash(profile)
  const name = PROFILE_LABEL[profile]
  const other = PROFILE_LABEL[profile === 'yo' ? 'novia' : 'yo']
  const savedBody = getBody(profile)
  const [cm, setCm] = useState(String(savedBody.cm))
  const [kg, setKg] = useState(String(savedBody.kg))
  useEffect(() => {
    const b = getBody(profile)
    setCm(String(b.cm))
    setKg(String(b.kg))
  }, [profile])
  const cloudStatus = useSyncExternalStore(subscribeSync, syncStatus, syncStatus)
  const [gap, setGap] = useState(() => getRestGap())
  const [wipe, setWipe] = useState(false)
  const [note, setNote] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const download = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tandem-copia.json'
    a.click()
    URL.revokeObjectURL(url)
    setNote('Copia descargada. Guárdala fuera del teléfono.')
  }

  const restore = async (file: File | undefined) => {
    if (!file) return
    try {
      const ok = importBackup(await file.text())
      if (!ok) {
        setNote('Ese archivo no es una copia de Tándem.')
        return
      }
      location.reload()
    } catch {
      setNote('No se pudo leer la copia.')
    }
  }
  const saveBody = () => {
    const cmN = Number(String(cm).replace(',', '.'))
    const kgN = Number(String(kg).replace(',', '.'))
    if (!Number.isFinite(cmN) || !Number.isFinite(kgN)) return
    setBody(profile, cmN, kgN)
    const b = getBody(profile)
    setCm(String(b.cm))
    setKg(String(b.kg))
  }
  const change = (d: number) => {
    const v = Math.min(180, Math.max(0, gap + d))
    setGap(v)
    setRestGap(v)
  }

  useEffect(() => {
    const el = document.getElementById(`set-sem-${semana}`)
    const parent = el?.parentElement
    if (!el || !parent) return
    parent.scrollTo({ left: el.offsetLeft - parent.clientWidth / 2 + el.offsetWidth / 2 })
  }, [semana, profile])

  return (
    <div>
      <h2 className="mb-3 text-center text-2xl font-bold uppercase">Ajustes</h2>

      {cloud && onLogout && (
        <div className="mb-5 rounded-3xl bg-[#17191d] p-4">
          <p className="text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Sesión abierta</p>
          <p className="mt-1 text-2xl font-bold">{PROFILE_LABEL[session ?? profile]}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#7C7C74]">
            Al abrir la app entras a la rutina de {PROFILE_LABEL[session ?? profile]}. El botón de arriba solo cambia de quién estás mirando.
          </p>
          <p className="mt-2 text-sm text-[#B2EE37]">
            {cloudStatus === 'syncing' && 'Subiendo…'}
            {cloudStatus === 'ok' && 'Al día con la nube'}
            {cloudStatus === 'offline' && 'Sin internet. Queda guardado en este teléfono y se sube al salir.'}
            {cloudStatus === 'local' && 'Nube no conectada'}
          </p>
          <button onClick={onLogout} className="mt-3 min-h-12 w-full rounded-2xl bg-[#1f2227] text-base font-bold">
            Cerrar sesión
          </button>
        </div>
      )}

      <p className="mb-1.5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Quién entrena</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setProfile('yo')} className={`min-h-14 rounded-2xl py-4 text-lg font-bold ${profile === 'yo' ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>{PROFILE_LABEL.yo}</button>
        <button onClick={() => setProfile('novia')} className={`min-h-14 rounded-2xl py-4 text-lg font-bold ${profile === 'novia' ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227]'}`}>{PROFILE_LABEL.novia}</button>
      </div>

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Semana del plan</p>
      <p className="mb-2 text-sm leading-relaxed text-[#7C7C74]">
        {PROFILE_LABEL[profile]} va en la semana <b className="font-display text-base text-[#FCFCFC]">{semana}</b>. El calendario y la rutina arrancan desde ahí.
      </p>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {semanas.map(s => (
          <button key={s} id={`set-sem-${s}`} onClick={() => setSemana(s)}
            className={`font-display h-11 w-11 shrink-0 rounded-2xl text-lg font-semibold ${semana === s ? 'bg-[#B2EE37] text-black' : 'bg-[#1f2227] text-[#7C7C74]'}`}>
            {s}
          </button>
        ))}
      </div>

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Extra al cambiar de ejercicio</p>
      <p className="mb-2 text-sm leading-relaxed text-[#7C7C74]">Se suma al descanso del ejercicio cuando pasas al siguiente.</p>
      <div className="flex items-center justify-between rounded-2xl bg-[#17191d] p-3">
        <button onClick={() => change(-15)} className="font-display h-14 w-14 rounded-2xl bg-[#1f2227] text-2xl font-semibold">−</button>
        <p className="font-display text-3xl font-semibold tabular-nums">{fmt(gap)}</p>
        <button onClick={() => change(15)} className="font-display h-14 w-14 rounded-2xl bg-[#1f2227] text-2xl font-semibold">+</button>
      </div>

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Tu cuerpo</p>
      <p className="mb-2 text-sm leading-relaxed text-[#7C7C74]">
        Con esto {name} recibe una guía de por dónde empezar la primera vez que no hay peso guardado.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-2xl bg-[#17191d] p-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Estatura</span>
          <span className="mt-1 flex items-baseline gap-1">
            <input value={cm} inputMode="decimal" onChange={e => setCm(e.target.value)} onBlur={saveBody}
              className="w-full bg-transparent text-2xl font-bold outline-none" />
            <span className="text-sm text-[#7C7C74]">cm</span>
          </span>
        </label>
        <label className="rounded-2xl bg-[#17191d] p-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#7C7C74]">Peso</span>
          <span className="mt-1 flex items-baseline gap-1">
            <input value={kg} inputMode="decimal" onChange={e => setKg(e.target.value)} onBlur={saveBody}
              className="w-full bg-transparent text-2xl font-bold outline-none" />
            <span className="text-sm text-[#7C7C74]">kg</span>
          </span>
        </label>
      </div>

      <RoutineEditor profile={profile} semana={semana} onChange={onRoutineChange} />

      <p className="mb-1.5 mt-5 text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Datos</p>
      <p className="mb-2 text-sm leading-relaxed text-[#7C7C74]">
        {cloud
          ? 'Los kilos se guardan en este teléfono y se suben a la nube en cuanto hay internet. La copia es un respaldo extra.'
          : 'Los kilos viven en este teléfono. Descarga una copia si cambias de celular. Cuando conectemos la nube, se sincronizan solos.'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={download} className="min-h-14 rounded-2xl bg-[#1f2227] py-3 text-base font-bold">Descargar copia</button>
        <button onClick={() => fileRef.current?.click()} className="min-h-14 rounded-2xl bg-[#1f2227] py-3 text-base font-bold">Restaurar copia</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
        onChange={e => { restore(e.target.files?.[0]); e.target.value = '' }} />
      {note && <p className="mt-2 text-sm text-[#B2EE37]">{note}</p>}

      {!wipe ? (
        <button onClick={() => setWipe(true)} className="mt-3 min-h-14 w-full rounded-2xl bg-[#1f2227] py-4 text-base font-bold text-red-400">
          Borrar datos de {name}
        </button>
      ) : (
        <div className="mt-3 rounded-3xl bg-[#17191d] p-4">
          <p className="text-sm leading-relaxed">Esto borra los kilos de {name} en este teléfono y, en cuanto haya internet, también en la nube. Los de {other} se quedan. Quedan las últimas 3 rutinas de {name} por si fue un error.</p>
          <button onClick={download} className="mt-3 min-h-12 w-full rounded-2xl bg-[#1f2227] text-sm font-bold">Descargar copia antes</button>
          <button onClick={() => { clearProfile(profile); location.reload() }} className="mt-2 min-h-12 w-full rounded-2xl bg-red-500/15 text-sm font-bold text-red-400">
            Sí, borrar lo de {name}
          </button>
          <button onClick={() => setWipe(false)} className="mt-2 min-h-12 w-full rounded-2xl text-sm font-bold text-[#7C7C74]">Cancelar</button>
        </div>
      )}

      {trash.length > 0 && (
        <div className="mt-3 rounded-3xl bg-[#17191d] p-4">
          <p className="text-sm font-bold uppercase tracking-wider text-[#7C7C74]">Rutinas borradas</p>
          <p className="mt-1 text-sm leading-relaxed text-[#7C7C74]">Las últimas 3 de {name}. Restaurar las vuelve a poner sin tocar lo de {other}.</p>
          <div className="mt-2 space-y-2">
            {trash.map(item => (
              <button key={item.id} onClick={() => { if (restoreTrash(item.id)) location.reload() }}
                className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-[#1f2227] px-3 text-left text-sm font-bold">
                <span>{new Date(item.at).toLocaleString('es', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                <span className="text-[#B2EE37]">Restaurar</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-center text-sm leading-relaxed text-[#7C7C74]">
        Fotos y videos: los que tú aportes. Videos de ejemplo: YouTube.
      </p>
    </div>
  )
}
