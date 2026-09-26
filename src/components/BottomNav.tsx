export type Tab = 'inicio' | 'rutina' | 'progreso' | 'ajustes'

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '⌂' },
  { id: 'rutina', label: 'Rutina', icon: '💪' },
  { id: 'progreso', label: 'Progresión', icon: '📈' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙' },
]

export default function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#23262c] bg-[#0F1012]/95 backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {ITEMS.map(it => (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${tab === it.id ? 'text-[#B2EE37]' : 'text-[#7C7C74]'}`}
          >
            <span className="text-xl leading-none">{it.icon}</span>
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
