// Persistencia Fase 1: localStorage por perfil (Yo / Novia). En Fase 2 se sincroniza con Supabase.
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

export interface HistEntry { profile: Profile; exerciseId: string; date: string; peso: number }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
function write(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* sin espacio */ }
}

export function getPeso(profile: Profile, exerciseId: string): number | '' {
  const all = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  return all[profile]?.[exerciseId] ?? ''
}
export function setPeso(profile: Profile, exerciseId: string, peso: number, dateStr?: string) {
  const all = read<Record<string, Record<string, number>>>(K_WEIGHTS, {})
  all[profile] = all[profile] ?? {}
  all[profile][exerciseId] = peso
  write(K_WEIGHTS, all)
  // historial para progresión semana a semana
  const hist = read<HistEntry[]>(K_HIST, [])
  const today = dateStr ?? todayStr()
  const last = [...hist].reverse().find(h => h.profile === profile && h.exerciseId === exerciseId)
  if (!last || last.peso !== peso || last.date !== today) {
    hist.push({ profile, exerciseId, date: today, peso })
    write(K_HIST, hist.slice(-2000))
  }
}
export function getHistory(profile: Profile, exerciseId: string): HistEntry[] {
  return read<HistEntry[]>(K_HIST, []).filter(h => h.profile === profile && h.exerciseId === exerciseId).slice(-8)
}

export function isSetDone(profile: Profile, key: string): boolean {
  return !!read<Record<string, Record<string, boolean>>>(K_DONE, {})[profile]?.[key]
}
export function toggleSetDone(profile: Profile, key: string) {
  const all = read<Record<string, Record<string, boolean>>>(K_DONE, {})
  all[profile] = all[profile] ?? {}
  all[profile][key] = !all[profile][key]
  write(K_DONE, all)
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
export function setRestGap(secs: number) { write(K_GAP, secs) }

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
  write(K_WEEK, next)
}

export function clearAll() {
  try {
    for (const k of [K_WEIGHTS, K_DONE, K_HIST, K_SESSIONS, K_REST, K_GAP, K_WEEK,
      'gymapp.weights.v1', 'gymapp.done.v1', 'gymapp.history.v1',
      'gymapp.sessions.v1', 'gymapp.restSecs.v1', 'gymapp.week.v1',
      'gymapp.workoutStart.v1', 'gymapp.workoutEnd.v1']) localStorage.removeItem(k)
  } catch { /* noop */ }
}

// ---- Sesiones ----
// Cada vez que das EMPEZAR se crea una sesión (el contador arranca de 0).
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
  write(K_SESSIONS, all.slice(-500))
  return s
}
export function endSession(profile: Profile, date: string, doneEx: number, totalEx: number): Session | null {
  const all = read<Session[]>(K_SESSIONS, [])
  const s = [...all].reverse().find(x => x.profile === profile && x.date === date && x.endTs === null)
  if (!s) return null
  s.endTs = Date.now()
  s.doneEx = doneEx
  s.totalEx = totalEx
  write(K_SESSIONS, all)
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
