import { useState } from 'react'
import { Delete } from 'lucide-react'
import { signInWithPin } from '../lib/auth'
import { PROFILE_LABEL, type Profile } from '../lib/storage'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const

export default function LoginScreen({ onSuccess }: { onSuccess: (profile: Profile) => void }) {
  const [who, setWho] = useState<Profile | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (next: string) => {
    if (!who || next.length !== 6 || busy) return
    setBusy(true)
    setError('')
    try {
      await signInWithPin(who, next)
      onSuccess(who)
    } catch (err) {
      setPin('')
      setError(err instanceof Error ? err.message : 'No se pudo entrar.')
    } finally {
      setBusy(false)
    }
  }

  const press = (key: string) => {
    if (busy || !who) return
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
      setError('')
      return
    }
    if (!key || pin.length >= 6) return
    const next = pin + key
    setPin(next)
    if (next.length === 6) void submit(next)
  }

  return (
    <div className="min-h-full bg-[#0F1012] text-[#FCFCFC]">
      <div className="glow left-[-80px] top-[-60px] h-72 w-72 bg-[#B2EE37]/15" />
      <div className="relative z-10 mx-auto flex min-h-full max-w-xl flex-col px-5 pb-10 pt-16">
        <p className="text-center text-sm font-bold uppercase tracking-wider text-[#B2EE37]">Solo ustedes dos</p>
        <h1 className="mt-1 text-center text-4xl font-bold">Tándem</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#7C7C74]">
          El PIN abre la puerta. Después el teléfono se acuerda y en el gym no hace falta repetirlo.
        </p>

        {!who ? (
          <div className="mt-10 grid grid-cols-2 gap-3">
            {(['yo', 'novia'] as const).map(p => (
              <button key={p} onClick={() => { setWho(p); setPin(''); setError('') }}
                className="min-h-28 rounded-3xl bg-[#17191d] text-2xl font-bold">
                {PROFILE_LABEL[p]}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <button onClick={() => { setWho(null); setPin(''); setError('') }} className="text-sm font-bold text-[#7C7C74]">
              ← {PROFILE_LABEL[who]}
            </button>
            <p className="mt-4 text-center text-lg font-bold">PIN de {PROFILE_LABEL[who]}</p>
            <div className="mt-4 flex justify-center gap-3">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={`h-3.5 w-3.5 rounded-full ${i < pin.length ? 'bg-[#B2EE37]' : 'bg-[#2c2f36]'}`} />
              ))}
            </div>
            {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
            {busy && <p className="mt-4 text-center text-sm text-[#7C7C74]">Entrando…</p>}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {KEYS.map(key => key === '' ? <span key="gap" /> : (
                <button key={key} onClick={() => press(key)} disabled={busy}
                  className="flex min-h-16 items-center justify-center rounded-2xl bg-[#17191d] text-2xl font-bold disabled:opacity-40">
                  {key === 'del' ? <Delete className="h-6 w-6" /> : key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
