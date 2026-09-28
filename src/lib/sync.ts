import { clearOutbox, enqueue, metaAt, onDirty, readOutbox, removeOutbox, setMeta, type SyncOp } from './outbox'
import { applyRemoteWipe, getWipedAt, ingestRemote, mergeTrash, notifyStorage, readTrash, snapshotLocal, type TrashEntry } from './storage'
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
  const take = async (query: PromiseLike<{ data: unknown; error: { message: string } | null }>, map: (row: Record<string, unknown>) => SyncOp | null) => {
    const { data, error } = await query
    if (error) throw new Error(error.message)
    const rows = Array.isArray(data) ? data : []
    for (const row of rows) {
      const op = map(row as Record<string, unknown>)
      if (op) ops.push(op)
    }
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
    const value = (r.value ?? {}) as { secs?: number; machine?: string; mins?: number; items?: TrashEntry[]; at?: string; cm?: number; kg?: number }
    const at = iso(r.updated_at)
    const id = String(r.id)
    const who = id.startsWith('wipe:') || id.startsWith('trash:') || id.startsWith('body:')
      ? id.split(':')[1]
      : ''
    const profile = who === 'novia' ? 'novia' : who === 'yo' ? 'yo' : undefined
    if (id.startsWith('wipe:') && profile) return { id, at, kind: 'wipe', profile }
    if (id.startsWith('trash:') && profile) return { id, at, kind: 'trash', profile, items: value.items ?? [] }
    if (id.startsWith('body:') && profile) return { id, at, kind: 'body', profile, cm: Number(value.cm), kg: Number(value.kg) }
    if (r.id === 'gap') return { id: 'gap', at, kind: 'gap', secs: Number(value.secs ?? 60) }
    if (r.id === 'cardio') {
      return { id: 'cardio', at, kind: 'cardio', machine: value.machine ?? 'Caminadora', mins: Number(value.mins ?? 15) }
    }
    return null
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
  } else if (op.kind === 'trash' && op.profile) {
    ;({ error } = await supabase.from('prefs').upsert({
      id: `trash:${op.profile}`, value: { items: op.items ?? [] }, updated_at: at,
    }, { onConflict: 'id' }))
  } else if (op.kind === 'body' && op.profile) {
    ;({ error } = await supabase.from('prefs').upsert({
      id: `body:${op.profile}`, value: { cm: op.cm, kg: op.kg }, updated_at: at,
    }, { onConflict: 'id' }))
  } else if (op.kind === 'wipe' && op.profile) {
    const tables = ['weights', 'history', 'checks', 'sessions', 'weeks', 'swaps'] as const
    for (const table of tables) {
      const deleted = await supabase.from(table).delete().eq('profile', op.profile)
      if (deleted.error) throw new Error(deleted.error.message)
    }
    ;({ error } = await supabase.from('prefs').upsert({
      id: `wipe:${op.profile}`, value: { at }, updated_at: at,
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
    for (const remoteWipe of remote.filter(op => op.kind === 'wipe' && op.profile)) {
      const pending = readOutbox().find(op => op.id === remoteWipe.id)
      if (remoteWipe.at > (pending?.at ?? getWipedAt(remoteWipe.profile!))) {
        applyRemoteWipe(remoteWipe.profile!, remoteWipe.at)
        changed = true
      }
    }
    const trashIds = (items: { id: string }[] | undefined) => (items ?? []).map(item => item.id).sort().join('|')
    for (const remoteTrash of remote.filter(op => op.kind === 'trash' && op.profile)) {
      const pending = readOutbox().find(op => op.id === remoteTrash.id)
      if (remoteTrash.at > (pending?.at ?? metaAt(remoteTrash.id))) {
        mergeTrash(remoteTrash.profile!, remoteTrash.items as TrashEntry[] | undefined, remoteTrash.at)
        removeOutbox(remoteTrash.id)
        changed = true
      }
      const localItems = readTrash(remoteTrash.profile!)
      if (trashIds(localItems) !== trashIds(remoteTrash.items as TrashEntry[] | undefined) && localItems.length) {
        enqueue({ id: remoteTrash.id, at: new Date().toISOString(), kind: 'trash', profile: remoteTrash.profile, items: localItems })
      }
    }
    const owner = (op: { profile?: 'yo' | 'novia'; session?: { profile: 'yo' | 'novia' } }) => op.profile ?? op.session?.profile
    for (const row of remote) {
      if (row.kind === 'wipe' || row.kind === 'trash') continue
      const who = owner(row)
      if (who && row.kind !== 'body' && row.at <= getWipedAt(who)) continue
      const pending = readOutbox().find(op => op.id === row.id)
      const localAt = pending?.at ?? metaAt(row.id)
      if (row.at > localAt) {
        ingestRemote(row)
        if (pending && row.at > pending.at) removeOutbox(row.id)
        changed = true
      }
    }
    const uploads = new Map<string, SyncOp>()
    for (const op of readOutbox()) {
      const who = owner(op)
      if (op.kind !== 'wipe' && op.kind !== 'trash' && op.kind !== 'body' && who && op.at && op.at <= getWipedAt(who)) continue
      uploads.set(op.id, op)
    }
    const remoteAt = new Map(remote.map(row => [row.id, row.at]))
    const now = new Date().toISOString()
    for (const op of snapshotLocal()) {
      if (uploads.has(op.id) || remoteAt.has(op.id) || metaAt(op.id)) continue
      const who = owner(op)
      if (who && getWipedAt(who)) continue
      uploads.set(op.id, { ...op, at: now })
    }
    const wipes = [...uploads.values()].filter(op => op.kind === 'wipe')
    for (const wipeOp of wipes) uploads.delete(wipeOp.id)
    const ordered = [...uploads.values(), ...wipes]
    for (const op of ordered) {
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
