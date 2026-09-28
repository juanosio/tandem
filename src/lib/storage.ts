// Local primero. Si hay Supabase, cada cambio entra a la cola y se sube al tener internet.
import { clearMetaMatching, clearOutbox, enqueue, readOutbox, replaceOutbox, setMeta, type SyncOp } from './outbox'

export type Profile = 'yo' | 'novia'

export const PROFILE_LABEL: Record<Profile, string> = {
  yo: 'Juan',
  novia: 'Marian',
}

// v2: reset limpio (los datos de prueba v1 se ignoran)
const K_WEIGHTS = 'gymapp.weights.v2'
const K_DONE = 'gymapp.done.v2'
const K_HIST = 'gymapp.history.v2'
const K_REST = 'gymapp.restSecs.v2'
const K_GAP = 'gymapp.restGap.v1' // segundos extra al cambiar de ejercicio
const K_WEEK = 'gymapp.week.v2' // semana de entrenamiento actual
const K_SESSIONS = 'gymapp.sessions.v2' // sesiones: cada rutina iniciada guarda su tiempo
const K_SWAP = 'gymapp.swap.v1' // ejercicio principal elegido por perfil
const K_CARDIO = 'gymapp.cardioPref.v1' // máquina y minutos del cardio extra de Juan
const K_TRASH = 'gymapp.trash.v1' // últimas 3 rutinas borradas, por persona
const K_WIPED = 'gymapp.wipedAt.v1' // marca de borrado por persona
const K_BODY = 'gymapp.body.v1'

export interface HistEntry { profile: Profile; exerciseId: string; date: string; peso: number }

let rev = 0
const listeners = new Set<() => void>()
export function storageRev(): number { return rev }
export function subscribeStorage(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function notifyStorage() {
  rev += 1
  listeners.forEach(fn => fn())
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function write(key: string, val: unknown, silent = false) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* sin espacio */ }
  if (!silent) notifyStorage()
}

function stamp(): string { return new Date().toISOString() }

export function getPeso(profile: Profile, exerciseId: string): number | '' {
  const all = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  return all[profile]?.[exerciseId] ?? ''
}
export function setPeso(profile: Profile, exerciseId: string, peso: number, dateStr?: string) {
  if (!Number.isFinite(peso) || peso <= 0) return
  const all = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  all[profile] = all[profile] ?? {}
  all[profile][exerciseId] = peso
  write(K_WEIGHTS, all, true)
  const today = dateStr ?? todayStr()
  const hist = read<HistEntry[]>(K_HIST, []).filter(h => !(h.profile === profile && h.exerciseId === exerciseId && h.date === today))
  hist.push({ profile, exerciseId, date: today, peso })
  write(K_HIST, hist.slice(-2000), true)
  const at = stamp()
  enqueue({ id: `weight:${profile}:${exerciseId}`, at, kind: 'weight', profile, exerciseId, peso })
  enqueue({ id: `hist:${profile}:${exerciseId}:${today}`, at, kind: 'hist', profile, exerciseId, date: today, peso })
  notifyStorage()
}
export function getHistory(profile: Profile, exerciseId: string): HistEntry[] {
  return read<HistEntry[]>(K_HIST, []).filter(h => h.profile === profile && h.exerciseId === exerciseId).slice(-16)
}

export function isSetDone(profile: Profile, key: string): boolean {
  return !!read<Record<string, Record<string, boolean>>>(K_DONE, {})[profile]?.[key]
}
export function toggleSetDone(profile: Profile, key: string) {
  const all = read<Record<string, Record<string, boolean>>>(K_DONE, {})
  all[profile] = all[profile] ?? {}
  all[profile][key] = !all[profile][key]
  write(K_DONE, all, true)
  enqueue({ id: `check:${profile}:${key}`, at: stamp(), kind: 'check', profile, key, done: !!all[profile][key] })
  notifyStorage()
}
export function todayStr(): string {
  // Fecha LOCAL (no UTC): así coincide con las píldoras y el calendario del tlf.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getRestSecs(): number {
  const v = read<number>(K_REST, 90)
  return typeof v === 'number' && v >= 15 ? v : 90
}
export function setRestSecs(secs: number) { write(K_REST, secs) }

export function getRestGap(): number {
  const v = read<number>(K_GAP, 60)
  return typeof v === 'number' && v >= 0 ? v : 60
}
export function setRestGap(secs: number) {
  write(K_GAP, secs, true)
  enqueue({ id: 'gap', at: stamp(), kind: 'gap', secs })
  notifyStorage()
}

type WeekStore = Partial<Record<Profile, number>>

function readWeekStore(): WeekStore | number {
  return read<WeekStore | number>(K_WEEK, 1)
}

export function getWeek(profile: Profile = 'yo'): number {
  const raw = readWeekStore()
  if (typeof raw === 'number') return raw || 1
  const own = raw?.[profile]
  if (typeof own === 'number' && own >= 1) return own
  const other = profile === 'yo' ? raw?.novia : raw?.yo
  return typeof other === 'number' && other >= 1 ? other : 1
}

export function setWeek(profile: Profile, w: number) {
  const raw = readWeekStore()
  const legacy = typeof raw === 'number' ? (raw || 1) : 1
  const next: WeekStore = typeof raw === 'object' && raw
    ? { yo: raw.yo ?? legacy, novia: raw.novia ?? legacy }
    : { yo: legacy, novia: legacy }
  next[profile] = w
  write(K_WEEK, next, true)
  enqueue({ id: `week:${profile}`, at: stamp(), kind: 'week', profile, week: w })
  notifyStorage()
}

const BACKUP_KEYS = [K_WEIGHTS, K_DONE, K_HIST, K_SESSIONS, K_REST, K_GAP, K_WEEK, K_SWAP, K_CARDIO]
const LEGACY_KEYS = [
  'gymapp.weights.v1', 'gymapp.done.v1', 'gymapp.history.v1',
  'gymapp.sessions.v1', 'gymapp.restSecs.v1', 'gymapp.week.v1',
  'gymapp.workoutStart.v1', 'gymapp.workoutEnd.v1',
]

export interface TrashEntry { id: string; at: string; profile: Profile; data: Record<string, unknown> }

const DEFAULT_BODY: Record<Profile, { cm: number; kg: number }> = {
  yo: { cm: 174, kg: 77 },
  novia: { cm: 155, kg: 45 },
}

export function getBody(profile: Profile): { cm: number; kg: number } {
  const saved = read<Partial<Record<Profile, { cm?: number; kg?: number }>>>(K_BODY, {})[profile]
  const base = DEFAULT_BODY[profile]
  const cm = Number(saved?.cm)
  const kg = Number(saved?.kg)
  return {
    cm: Number.isFinite(cm) && cm >= 120 && cm <= 230 ? Math.round(cm) : base.cm,
    kg: Number.isFinite(kg) && kg >= 30 && kg <= 250 ? Math.round(kg * 10) / 10 : base.kg,
  }
}

export function setBody(profile: Profile, cm: number, kg: number) {
  const all = read<Partial<Record<Profile, { cm: number; kg: number }>>>(K_BODY, {})
  const next = { cm: Math.round(cm), kg: Math.round(kg * 10) / 10 }
  all[profile] = next
  write(K_BODY, all, true)
  enqueue({ id: `body:${profile}`, at: stamp(), kind: 'body', profile, cm: next.cm, kg: next.kg })
  notifyStorage()
}

function captureProfile(profile: Profile): Record<string, unknown> {
  const weights = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})[profile]
  const done = read<Record<string, Record<string, boolean>>>(K_DONE, {})[profile]
  const hist = read<HistEntry[]>(K_HIST, []).filter(h => h.profile === profile)
  const sessions = read<Session[]>(K_SESSIONS, []).filter(s => s.profile === profile)
  const swaps = read<Partial<Record<Profile, Record<string, string>>>>(K_SWAP, {})[profile]
  return {
    weights: weights ?? {},
    done: done ?? {},
    hist,
    sessions,
    week: getWeek(profile),
    swap: swaps ?? {},
  }
}

function profileHasData(data: Record<string, unknown>): boolean {
  const weights = data.weights as Record<string, number> | undefined
  const done = data.done as Record<string, boolean> | undefined
  const hist = data.hist as unknown[] | undefined
  const sessions = data.sessions as unknown[] | undefined
  const swap = data.swap as Record<string, string> | undefined
  return Boolean(
    (weights && Object.keys(weights).length) ||
    (done && Object.keys(done).length) ||
    (hist && hist.length) ||
    (sessions && sessions.length) ||
    (swap && Object.keys(swap).length),
  )
}

function stripProfile(profile: Profile) {
  const weights = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  delete weights[profile]
  write(K_WEIGHTS, weights, true)
  const done = read<Record<string, Record<string, boolean>>>(K_DONE, {})
  delete done[profile]
  write(K_DONE, done, true)
  write(K_HIST, read<HistEntry[]>(K_HIST, []).filter(h => h.profile !== profile), true)
  write(K_SESSIONS, read<Session[]>(K_SESSIONS, []).filter(s => s.profile !== profile), true)
  const swaps = read<Partial<Record<Profile, Record<string, string>>>>(K_SWAP, {})
  delete swaps[profile]
  write(K_SWAP, swaps, true)
  const raw = readWeekStore()
  const legacy = typeof raw === 'number' ? (raw || 1) : 1
  const next: WeekStore = typeof raw === 'object' && raw
    ? { yo: raw.yo ?? legacy, novia: raw.novia ?? legacy }
    : { yo: legacy, novia: legacy }
  next[profile] = 1
  write(K_WEEK, next, true)
}

function belongsTo(op: SyncOp, profile: Profile): boolean {
  return op.profile === profile || op.session?.profile === profile
}

function captureBackup(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const k of BACKUP_KEYS) {
    try {
      const raw = localStorage.getItem(k)
      if (raw) data[k] = JSON.parse(raw)
    } catch { /* clave dañada: se omite de la copia */ }
  }
  return data
}

function clearTrainingKeys() {
  try {
    for (const k of [...BACKUP_KEYS, ...LEGACY_KEYS]) localStorage.removeItem(k)
  } catch { /* noop */ }
}

function readWipes(): Partial<Record<Profile, string>> {
  const raw = read<Partial<Record<Profile, string>> | string>(K_WIPED, {})
  return typeof raw === 'string' ? {} : (raw ?? {})
}

export function getWipedAt(profile: Profile): string {
  return readWipes()[profile] ?? ''
}

function setWipedAt(profile: Profile, at: string) {
  const all = readWipes()
  all[profile] = at
  write(K_WIPED, all, true)
}

export function readTrash(profile?: Profile): TrashEntry[] {
  const all = read<TrashEntry[]>(K_TRASH, [])
  const list = Array.isArray(all) ? all.filter(item => item?.id && item.data && item.profile) : []
  const mine = profile ? list.filter(item => item.profile === profile) : list
  return mine.sort((a, b) => b.at.localeCompare(a.at)).slice(0, profile ? 3 : 6)
}

export function mergeTrash(profile: Profile, incoming: TrashEntry[] | undefined, at: string) {
  const others = read<TrashEntry[]>(K_TRASH, []).filter(item => item?.profile && item.profile !== profile)
  const map = new Map<string, TrashEntry>()
  for (const item of [...readTrash(profile), ...(incoming ?? [])]) {
    if (item?.id && item.data) map.set(item.id, { ...item, profile })
  }
  const mine = [...map.values()].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3)
  write(K_TRASH, [...others, ...mine], true)
  setMeta(`trash:${profile}`, at)
}

export function applyRemoteWipe(profile: Profile, at: string) {
  if (!at || at <= getWipedAt(profile)) return
  const sessions = read<Session[]>(K_SESSIONS, []).filter(s => s.profile === profile).map(s => s.id)
  stripProfile(profile)
  clearMetaMatching(id => id.includes(`:${profile}`) || sessions.some(sid => id === `session:${sid}`))
  setWipedAt(profile, at)
  replaceOutbox(readOutbox().filter(op => !belongsTo(op, profile) || (op.at > at && op.kind !== 'wipe')))
}

export function clearProfile(profile: Profile) {
  const data = captureProfile(profile)
  const at = stamp()
  const has = profileHasData(data)
  const kept = readOutbox().filter(op => !belongsTo(op, profile))
  const sessions = read<Session[]>(K_SESSIONS, []).filter(s => s.profile === profile).map(s => s.id)
  stripProfile(profile)
  clearMetaMatching(id => id.includes(`:${profile}`) || sessions.some(sid => id === `session:${sid}`))
  setWipedAt(profile, at)
  replaceOutbox(kept)
  const others = read<TrashEntry[]>(K_TRASH, []).filter(item => item?.profile && item.profile !== profile)
  const mine = has ? [{ id: at, at, profile, data }, ...readTrash(profile)].slice(0, 3) : readTrash(profile)
  if (mine.length || others.length) write(K_TRASH, [...others, ...mine], true)
  if (has) enqueue({ id: `trash:${profile}`, at, kind: 'trash', profile, items: mine })
  enqueue({ id: `wipe:${profile}`, at, kind: 'wipe', profile })
  notifyStorage()
}

function restoreSlice(profile: Profile, data: Record<string, unknown>) {
  const weights = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  weights[profile] = (data.weights as Record<string, number>) ?? {}
  write(K_WEIGHTS, weights, true)
  const done = read<Record<string, Record<string, boolean>>>(K_DONE, {})
  done[profile] = (data.done as Record<string, boolean>) ?? {}
  write(K_DONE, done, true)
  const hist = read<HistEntry[]>(K_HIST, []).filter(h => h.profile !== profile)
  const backHist = Array.isArray(data.hist) ? data.hist as HistEntry[] : []
  write(K_HIST, [...hist, ...backHist].slice(-2000), true)
  const sessions = read<Session[]>(K_SESSIONS, []).filter(s => s.profile !== profile)
  const backSessions = Array.isArray(data.sessions) ? data.sessions as Session[] : []
  write(K_SESSIONS, [...sessions, ...backSessions].slice(-500), true)
  const swaps = read<Partial<Record<Profile, Record<string, string>>>>(K_SWAP, {})
  swaps[profile] = (data.swap as Record<string, string>) ?? {}
  write(K_SWAP, swaps, true)
  if (typeof data.week === 'number' && data.week >= 1) {
    const raw = readWeekStore()
    const legacy = typeof raw === 'number' ? (raw || 1) : 1
    const next: WeekStore = typeof raw === 'object' && raw
      ? { yo: raw.yo ?? legacy, novia: raw.novia ?? legacy }
      : { yo: legacy, novia: legacy }
    next[profile] = data.week
    write(K_WEEK, next, true)
  }
}

export function restoreTrash(id: string): boolean {
  const item = readTrash().find(entry => entry.id === id)
  if (!item?.profile) return false
  restoreSlice(item.profile, item.data)
  const at = stamp()
  for (const op of snapshotLocal()) {
    if (!belongsTo(op, item.profile)) continue
    enqueue({ ...op, at })
  }
  notifyStorage()
  return true
}

export function exportBackup(): string {
  return JSON.stringify({ app: 'tandem', v: 1, at: new Date().toISOString(), data: captureBackup() })
}

export function importBackup(raw: string): boolean {
  const parsed = JSON.parse(raw) as { app?: string; data?: Record<string, unknown> }
  if (parsed?.app !== 'tandem' || !parsed.data || typeof parsed.data !== 'object') return false
  for (const k of BACKUP_KEYS) {
    if (k in parsed.data && parsed.data[k] != null) write(k, parsed.data[k], true)
  }
  const at = stamp()
  for (const op of snapshotLocal()) enqueue({ ...op, at })
  notifyStorage()
  return true
}

type SwapStore = Partial<Record<Profile, Record<string, string>>>

export function getPrincipal(profile: Profile, slotKey: string): string | null {
  return read<SwapStore>(K_SWAP, {})[profile]?.[slotKey] ?? null
}

export function setPrincipal(profile: Profile, slotKey: string, chosenKey: string) {
  const all = read<SwapStore>(K_SWAP, {})
  const mine = { ...(all[profile] ?? {}) }
  if (chosenKey === slotKey) delete mine[slotKey]
  else mine[slotKey] = chosenKey
  all[profile] = mine
  write(K_SWAP, all, true)
  const at = stamp()
  enqueue({
    id: `swap:${profile}:${slotKey}`,
    at,
    kind: 'swap',
    profile,
    slot: slotKey,
    chosen: chosenKey === slotKey ? null : chosenKey,
  })
  notifyStorage()
}

export interface CardioPref { machine: string; mins: number }

export function getCardioPref(): CardioPref {
  const v = read<CardioPref>(K_CARDIO, { machine: 'Caminadora', mins: 15 })
  const mins = [10, 15, 20, 30].includes(v?.mins) ? v.mins : 15
  return { machine: v?.machine || 'Caminadora', mins }
}

export function setCardioPref(pref: CardioPref) {
  write(K_CARDIO, pref, true)
  enqueue({ id: 'cardio', at: stamp(), kind: 'cardio', machine: pref.machine, mins: pref.mins })
  notifyStorage()
}

// ---- Sesiones ----
// La sesión (y el contador) arranca al pasar a las pesas, no al mirar la app.
// Al TERMINAR se cierra con su duración. Eso alimenta: promedio por día,
// estimado en HOY TOCA, puntitos verdes, calendario y meta semanal.
// Los pesos e historial NO se borran: los checks son por fecha pero tus kg se recuerdan.
export interface Session {
  id: string
  profile: Profile
  date: string // yyyy-mm-dd
  dia: string // Lunes..Viernes
  startTs: number
  endTs: number | null
  doneEx: number
  totalEx: number
}

export function startSession(profile: Profile, date: string, dia: string, totalEx: number): Session {
  const all = read<Session[]>(K_SESSIONS, [])
  const s: Session = { id: `${Date.now()}`, profile, date, dia, startTs: Date.now(), endTs: null, doneEx: 0, totalEx }
  all.push(s)
  write(K_SESSIONS, all.slice(-500), true)
  enqueue({
    id: `session:${s.id}`,
    at: stamp(),
    kind: 'session',
    session: s,
  })
  notifyStorage()
  return s
}
export function endSession(profile: Profile, date: string, doneEx: number, totalEx: number): Session | null {
  const all = read<Session[]>(K_SESSIONS, [])
  const s = [...all].reverse().find(x => x.profile === profile && x.date === date && x.endTs === null)
  if (!s) return null
  s.endTs = Date.now()
  s.doneEx = doneEx
  s.totalEx = totalEx
  write(K_SESSIONS, all, true)
  enqueue({ id: `session:${s.id}`, at: stamp(), kind: 'session', session: { ...s } })
  notifyStorage()
  return s
}
// Última sesión del día (abierta o cerrada): para mostrar el cronómetro / congelarlo.
export function getLastSession(profile: Profile, date: string): Session | null {
  const all = read<Session[]>(K_SESSIONS, [])
  return [...all].reverse().find(x => x.profile === profile && x.date === date) ?? null
}
export function getSessions(profile: Profile): Session[] {
  return read<Session[]>(K_SESSIONS, []).filter(x => x.profile === profile)
}
// Días con rutina TERMINADA (puntito verde, meta, calendario).
export function getFinishedDates(profile: Profile): string[] {
  const set = new Set<string>()
  for (const s of getSessions(profile)) if (s.endTs !== null) set.add(s.date)
  return [...set].sort()
}
// Promedio de duración de un día de rutina (ej: cuánto tardas los Lunes).
export function getAvgMs(profile: Profile, dia: string): number | null {
  const ds = getSessions(profile).filter(s => s.dia === dia && s.endTs !== null)
  if (ds.length === 0) return null
  return Math.round(ds.reduce((a, s) => a + ((s.endTs as number) - s.startTs), 0) / ds.length)
}
export function fmtDurMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}
export function fmtMin(ms: number): string {
  const m = Math.round(ms / 60000)
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `~${Math.max(1, m)} min`
}

// Fechas con al menos 1 serie de trabajo completada (para meta semanal y calendario).
export function getTrainedDates(profile: Profile): string[] {
  const all = read<Record<string, Record<string, boolean>>>(K_DONE, {})[profile] ?? {}
  const dates = new Set<string>()
  for (const key of Object.keys(all)) {
    if (!all[key]) continue
    const m = key.match(/^(\d{4}-\d{2}-\d{2}):.*:(work\d+)$/)
    if (m) dates.add(m[1])
  }
  return [...dates].sort()
}
// Puntito verde: rutina terminada o, si no llegaste a Terminar, al menos una serie de trabajo.
export function getMarkedDates(profile: Profile): string[] {
  return [...new Set([...getFinishedDates(profile), ...getTrainedDates(profile)])].sort()
}

function isProfile(v: unknown): v is Profile {
  return v === 'yo' || v === 'novia'
}

export function snapshotLocal(): SyncOp[] {
  const ops: SyncOp[] = []
  const weights = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  for (const profile of ['yo', 'novia'] as const) {
    for (const [exerciseId, peso] of Object.entries(weights[profile] ?? {})) {
      if (peso > 0) ops.push({ id: `weight:${profile}:${exerciseId}`, at: '', kind: 'weight', profile, exerciseId, peso })
    }
  }
  for (const h of read<HistEntry[]>(K_HIST, [])) {
    ops.push({ id: `hist:${h.profile}:${h.exerciseId}:${h.date}`, at: '', kind: 'hist', profile: h.profile, exerciseId: h.exerciseId, date: h.date, peso: h.peso })
  }
  const done = read<Record<string, Record<string, boolean>>>(K_DONE, {})
  for (const profile of ['yo', 'novia'] as const) {
    for (const [key, value] of Object.entries(done[profile] ?? {})) {
      ops.push({ id: `check:${profile}:${key}`, at: '', kind: 'check', profile, key, done: !!value })
    }
  }
  for (const s of read<Session[]>(K_SESSIONS, [])) {
    ops.push({ id: `session:${s.id}`, at: '', kind: 'session', session: s })
  }
  const rawWeek = localStorage.getItem(K_WEEK)
  if (rawWeek) {
    const store = readWeekStore()
    const asObj: Partial<Record<Profile, number>> = typeof store === 'number'
      ? { yo: store, novia: store }
      : store
    for (const profile of ['yo', 'novia'] as const) {
      const week = asObj[profile]
      if (typeof week === 'number' && week >= 1) ops.push({ id: `week:${profile}`, at: '', kind: 'week', profile, week })
    }
  }
  const swaps = read<Partial<Record<Profile, Record<string, string>>>>(K_SWAP, {})
  for (const profile of ['yo', 'novia'] as const) {
    for (const [slot, chosen] of Object.entries(swaps[profile] ?? {})) {
      if (chosen) ops.push({ id: `swap:${profile}:${slot}`, at: '', kind: 'swap', profile, slot, chosen })
    }
  }
  if (localStorage.getItem(K_GAP)) {
    ops.push({ id: 'gap', at: '', kind: 'gap', secs: getRestGap() })
  }
  if (localStorage.getItem(K_CARDIO)) {
    const pref = getCardioPref()
    ops.push({ id: 'cardio', at: '', kind: 'cardio', machine: pref.machine, mins: pref.mins })
  }
  return ops
}

export function ingestRemote(op: SyncOp) {
  if (op.kind === 'weight' && isProfile(op.profile) && op.exerciseId && typeof op.peso === 'number') {
    const all = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
    all[op.profile] = all[op.profile] ?? {}
    all[op.profile][op.exerciseId] = op.peso
    write(K_WEIGHTS, all, true)
  } else if (op.kind === 'hist' && isProfile(op.profile) && op.exerciseId && op.date && typeof op.peso === 'number') {
    const hist = read<HistEntry[]>(K_HIST, []).filter(h => !(h.profile === op.profile && h.exerciseId === op.exerciseId && h.date === op.date))
    hist.push({ profile: op.profile, exerciseId: op.exerciseId, date: op.date, peso: op.peso })
    write(K_HIST, hist.slice(-2000), true)
  } else if (op.kind === 'check' && isProfile(op.profile) && op.key) {
    const all = read<Record<string, Record<string, boolean>>>(K_DONE, {})
    all[op.profile] = all[op.profile] ?? {}
    all[op.profile][op.key] = !!op.done
    write(K_DONE, all, true)
  } else if (op.kind === 'session' && op.session) {
    const all = read<Session[]>(K_SESSIONS, []).filter(s => s.id !== op.session!.id)
    all.push(op.session)
    write(K_SESSIONS, all.slice(-500), true)
  } else if (op.kind === 'week' && isProfile(op.profile) && typeof op.week === 'number') {
    const raw = readWeekStore()
    const legacy = typeof raw === 'number' ? (raw || 1) : 1
    const next: WeekStore = typeof raw === 'object' && raw
      ? { yo: raw.yo ?? legacy, novia: raw.novia ?? legacy }
      : { yo: legacy, novia: legacy }
    next[op.profile] = op.week
    write(K_WEEK, next, true)
  } else if (op.kind === 'swap' && isProfile(op.profile) && op.slot) {
    const all = read<Partial<Record<Profile, Record<string, string>>>>(K_SWAP, {})
    const mine = { ...(all[op.profile] ?? {}) }
    if (!op.chosen) delete mine[op.slot]
    else mine[op.slot] = op.chosen
    all[op.profile] = mine
    write(K_SWAP, all, true)
  } else if (op.kind === 'gap' && typeof op.secs === 'number') {
    write(K_GAP, op.secs, true)
  } else if (op.kind === 'cardio' && op.machine && typeof op.mins === 'number') {
    write(K_CARDIO, { machine: op.machine, mins: op.mins }, true)
  } else if (op.kind === 'body' && isProfile(op.profile) && typeof op.cm === 'number' && typeof op.kg === 'number') {
    const all = read<Partial<Record<Profile, { cm: number; kg: number }>>>(K_BODY, {})
    all[op.profile] = { cm: op.cm, kg: op.kg }
    write(K_BODY, all, true)
  } else {
    return
  }
  setMeta(op.id, op.at)
}
