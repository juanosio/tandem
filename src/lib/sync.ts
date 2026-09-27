import { clearOutbox, metaAt, onDirty, readOutbox, removeOutbox, setMeta, type SyncOp } from './outbox'
import { ingestRemote, notifyStorage, snapshotLocal } from './storage'
import { isCloudConfigured, supabase } from './supabase'

export type SyncStatus = 'local' | 'ok' | 'syncing' | 'offline'

let status: SyncStatus = isCloudConfigured() ? 'offline' : 'local'
const watchers = new Set<() => void>()

function setStatus(next: SyncStatus) {
  if (status === next) return
  status = next
  watchers.forEach(fn => fn())
}

export function syncStatus(): SyncStatus { return status }
export function subscribeSync(fn: () => void) {
  watchers.add(fn)
  return () => watchers.delete(fn)
}

async function fetchRemote(): Promise<SyncOp[]> {
  if (!supabase) return []
  const ops: SyncOp[] = []
  const take = async (query: PromiseLike<{ data: unknown; error: { message: string } | null }>, map: (row: Record<string, unknown>) => SyncOp) => {
    const { data, error } = await query
    if (error) throw new Error(error.message)
    const rows = Array.isArray(data) ? data : []
    for (const row of rows) ops.push(map(row as Record<string, unknown>))
  }
  const iso = (v: unknown) => typeof v === 'string' ? v : new Date(String(v)).toISOString()

  await take(supabase.from('weights').select('*'), r => ({
    id: `weight:${r.profile}:${r.exercise_id}`,
    at: iso(r.updated_at),
    kind: 'weight',
    profile: r.profile as SyncOp['profile'],
    exerciseId: String(r.exercise_id),
    peso: Number(r.peso),
  }))
  await take(supabase.from('history').select('*'), r => ({
    id: `hist:${r.profile}:${r.exercise_id}:${r.date}`,
    at: iso(r.updated_at),
    kind: 'hist',
    profile: r.profile as SyncOp['profile'],
    exerciseId: String(r.exercise_id),
    date: String(r.date),
    peso: Number(r.peso),
  }))
  await take(supabase.from('checks').select('*'), r => ({
    id: `check:${r.profile}:${r.key}`,
    at: iso(r.updated_at),
    kind: 'check',
    profile: r.profile as SyncOp['profile'],
    key: String(r.key),
    done: !!r.done,
  }))
  await take(supabase.from('sessions').select('*'), r => ({
    id: `session:${r.id}`,
    at: iso(r.updated_at),
    kind: 'session',
    session: {
      id: String(r.id),
      profile: r.profile === 'novia' ? 'novia' : 'yo',
      date: String(r.date),
      dia: String(r.dia),
      startTs: Number(r.start_ts),
      endTs: r.end_ts == null ? null : Number(r.end_ts),
      doneEx: Number(r.done_ex),
      totalEx: Number(r.total_ex),
    },
  }))
  await take(supabase.from('weeks').select('*'), r => ({
    id: `week:${r.profile}`,
    at: iso(r.updated_at),
    kind: 'week',
    profile: r.profile as SyncOp['profile'],
    week: Number(r.week),
  }))
  await take(supabase.from('swaps').select('*'), r => ({
    id: `swap:${r.profile}:${r.slot_key}`,
    at: iso(r.updated_at),
    kind: 'swap',
    profile: r.profile as SyncOp['profile'],
    slot: String(r.slot_key),
    chosen: String(r.chosen_key),
  }))
  await take(supabase.from('prefs').select('*'), r => {
    const value = (r.value ?? {}) as { secs?: number; machine?: string; mins?: number }
    if (r.id === 'gap') {
      return { id: 'gap', at: iso(r.updated_at), kind: 'gap', secs: Number(value.secs ?? 60) }
    }
    return {
      id: 'cardio',
      at: iso(r.updated_at),
      kind: 'cardio',
      machine: value.machine ?? 'Caminadora',
      mins: Number(value.mins ?? 15),
    }
  })
  return ops
}

async function pushOp(op: SyncOp) {
  if (!supabase) return
  const at = op.at
  let error: { message: string } | null = null
  if (op.kind === 'weight') {
    ;({ error } = await supabase.from('weights').upsert({
      profile: op.profile, exercise_id: op.exerciseId, peso: op.peso, updated_at: at,
    }, { onConflict: 'profile,exercise_id' }))
  } else if (op.kind === 'hist') {
    ;({ error } = await supabase.from('history').upsert({
      profile: op.profile, exercise_id: op.exerciseId, date: op.date, peso: op.peso, updated_at: at,
    }, { onConflict: 'profile,exercise_id,date' }))
  } else if (op.kind === 'check') {
    ;({ error } = await supabase.from('checks').upsert({
      profile: op.profile, key: op.key, done: op.done, updated_at: at,
    }, { onConflict: 'profile,key' }))
  } else if (op.kind === 'session' && op.session) {
    const s = op.session
    ;({ error } = await supabase.from('sessions').upsert({
      id: s.id, profile: s.profile, date: s.date, dia: s.dia,
      start_ts: s.startTs, end_ts: s.endTs, done_ex: s.doneEx, total_ex: s.totalEx, updated_at: at,
    }, { onConflict: 'id' }))
  } else if (op.kind === 'week') {
    ;({ error } = await supabase.from('weeks').upsert({
      profile: op.profile, week: op.week, updated_at: at,
    }, { onConflict: 'profile' }))
  } else if (op.kind === 'swap' && op.profile && op.slot) {
    if (!op.chosen) {
      ;({ error } = await supabase.from('swaps').delete().eq('profile', op.profile).eq('slot_key', op.slot))
    } else {
      ;({ error } = await supabase.from('swaps').upsert({
        profile: op.profile, slot_key: op.slot, chosen_key: op.chosen, updated_at: at,
      }, { onConflict: 'profile,slot_key' }))
    }
  } else if (op.kind === 'gap') {
    ;({ error } = await supabase.from('prefs').upsert({
      id: 'gap', value: { secs: op.secs }, updated_at: at,
    }, { onConflict: 'id' }))
  } else if (op.kind === 'cardio') {
    ;({ error } = await supabase.from('prefs').upsert({
      id: 'cardio', value: { machine: op.machine, mins: op.mins }, updated_at: at,
    }, { onConflict: 'id' }))
  }
  if (error) throw new Error(error.message)
}

let running = false
let queued = false

export async function syncNow() {
  if (!isCloudConfigured() || !supabase) {
    setStatus('local')
    return
  }
  if (!navigator.onLine) {
    setStatus('offline')
    return
  }
  const { data } = await supabase.auth.getSession()
  if (!data.session) return
  if (running) {
    queued = true
    return
  }
  running = true
  setStatus('syncing')
  try {
    const remote = await fetchRemote()
    let changed = false
    for (const row of remote) {
      const pending = readOutbox().find(op => op.id === row.id)
      const localAt = pending?.at ?? metaAt(row.id)
      if (row.at > localAt) {
        ingestRemote(row)
        if (pending && row.at > pending.at) removeOutbox(row.id)
        changed = true
      }
    }
    const uploads = new Map<string, SyncOp>()
    for (const op of readOutbox()) uploads.set(op.id, op)
    const remoteAt = new Map(remote.map(row => [row.id, row.at]))
    const now = new Date().toISOString()
    for (const op of snapshotLocal()) {
      if (uploads.has(op.id) || remoteAt.has(op.id) || metaAt(op.id)) continue
      uploads.set(op.id, { ...op, at: now })
    }
    for (const op of uploads.values()) {
      await pushOp(op)
      removeOutbox(op.id)
      setMeta(op.id, op.at)
      changed = true
    }
    if (changed) notifyStorage()
    setStatus('ok')
  } catch {
    setStatus(navigator.onLine ? 'offline' : 'offline')
  } finally {
    running = false
    if (queued) {
      queued = false
      void syncNow()
    }
  }
}

let started = false
export function startSync() {
  if (started || !isCloudConfigured()) return
  started = true
  const kick = () => { void syncNow() }
  window.addEventListener('online', kick)
  window.addEventListener('offline', () => setStatus('offline'))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') kick()
  })
  window.setInterval(kick, 20000)
  let debounce = 0
  onDirty(() => {
    window.clearTimeout(debounce)
    debounce = window.setTimeout(kick, 800)
  })
  kick()
}

export function resetSyncQueue() {
  clearOutbox()
}
