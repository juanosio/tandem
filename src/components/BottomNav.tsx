import { Dumbbell, House, Settings, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Tab = 'inicio' | 'rutina' | 'progreso' | 'ajustes'

const ITEMS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'inicio', label: 'Inicio', Icon: House },
  { id: 'rutina', label: 'Rutina', Icon: Dumbbell },
  { id: 'progreso', label: 'Progresión', Icon: TrendingUp },
  { id: 'ajustes', label: 'Ajustes', Icon: Settings },
]

export default function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#23262c] bg-[#0F1012]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {ITEMS.map(it => (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-xs font-bold ${tab === it.id ? 'text-[#B2EE37]' : 'text-[#7C7C74]'}`}
          >
            <it.Icon className="h-5 w-5" strokeWidth={2.25} />
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
