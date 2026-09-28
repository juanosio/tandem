import type { Profile } from './storage'

const K_OUT = 'gymapp.outbox.v1'
const K_META = 'gymapp.syncmeta.v1'

export interface SyncSession {
  id: string
  profile: Profile
  date: string
  dia: string
  startTs: number
  endTs: number | null
  doneEx: number
  totalEx: number
}

export interface SyncOp {
  id: string
  at: string
  kind: 'weight' | 'hist' | 'check' | 'session' | 'week' | 'swap' | 'gap' | 'cardio' | 'wipe' | 'trash'
  items?: { id: string; at: string; data: Record<string, unknown> }[]
  profile?: Profile
  exerciseId?: string
  peso?: number
  date?: string
  key?: string
  done?: boolean
  week?: number
  slot?: string
  chosen?: string | null
  secs?: number
  machine?: string
  mins?: number
  session?: SyncSession
}

type DirtyListener = () => void
const dirty = new Set<DirtyListener>()

function readOps(): SyncOp[] {
  try {
    const raw = localStorage.getItem(K_OUT)
    return raw ? (JSON.parse(raw) as SyncOp[]) : []
  } catch { return [] }
}
function saveOps(ops: SyncOp[]) {
  try { localStorage.setItem(K_OUT, JSON.stringify(ops.slice(-2000))) } catch { /* */ }
}

export function readOutbox(): SyncOp[] { return readOps() }

export function enqueue(op: SyncOp) {
  const all = readOps().filter(x => x.id !== op.id)
  all.push(op)
  saveOps(all)
  setMeta(op.id, op.at)
  dirty.forEach(fn => fn())
}

export function removeOutbox(id: string) {
  saveOps(readOps().filter(x => x.id !== id))
}

export function clearOutbox() {
  try { localStorage.removeItem(K_OUT) } catch { /* */ }
}

function readMeta(): Record<string, string> {
  try {
    const raw = localStorage.getItem(K_META)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch { return {} }
}

export function metaAt(id: string): string {
  return readMeta()[id] ?? ''
}

export function setMeta(id: string, at: string) {
  const all = readMeta()
  all[id] = at
  try { localStorage.setItem(K_META, JSON.stringify(all)) } catch { /* */ }
}

export function clearMeta() {
  try { localStorage.removeItem(K_META) } catch { /* */ }
}

export function onDirty(fn: DirtyListener) {
  dirty.add(fn)
  return () => dirty.delete(fn)
}
