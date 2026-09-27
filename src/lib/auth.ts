import type { Profile } from './storage'
import { isCloudConfigured, supabase } from './supabase'

const K_WHO = 'gymapp.who'
const EMAIL: Record<Profile, string> = {
  yo: 'juan@tandem.app',
  novia: 'marian@tandem.app',
}

export function profileFromEmail(email: string | undefined): Profile | null {
  if (!email) return null
  const e = email.toLowerCase()
  if (e === EMAIL.yo) return 'yo'
  if (e === EMAIL.novia) return 'novia'
  return null
}

export function rememberedProfile(): Profile | null {
  const v = localStorage.getItem(K_WHO)
  return v === 'yo' || v === 'novia' ? v : null
}

export async function restoreSession(): Promise<Profile | null> {
  if (!isCloudConfigured() || !supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    const who = profileFromEmail(data.session?.user.email)
    if (who) {
      localStorage.setItem(K_WHO, who)
      return who
    }
  } catch { /* sin red: se usa la sesión recordada */ }
  if (!navigator.onLine) return rememberedProfile()
  return null
}

export async function signInWithPin(profile: Profile, pin: string): Promise<void> {
  if (!supabase) throw new Error('La nube no está conectada.')
  const { error } = await supabase.auth.signInWithPassword({
    email: EMAIL[profile],
    password: pin,
  })
  if (error) {
    const m = error.message.toLowerCase()
    if (m.includes('invalid login') || m.includes('invalid credentials')) throw new Error('PIN incorrecto.')
    if (m.includes('not confirmed')) throw new Error('Ese usuario todavía no está confirmado en Supabase.')
    if (m.includes('fetch') || m.includes('network') || m.includes('failed')) throw new Error('Sin internet. La primera vez hace falta conexión.')
    throw new Error('No se pudo entrar. Revisa el PIN.')
  }
  localStorage.setItem(K_WHO, profile)
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(K_WHO)
  if (supabase) await supabase.auth.signOut()
}
