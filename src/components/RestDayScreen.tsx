import { Moon } from 'lucide-react'

export default function RestDayScreen() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="rest-bob mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#B2EE37]/15">
        <Moon className="h-14 w-14 text-[#B2EE37]" strokeWidth={1.75} />
      </div>
      <h2 className="text-3xl font-bold">Hoy es día de descanso</h2>
      <p className="mt-2 max-w-xs text-base leading-relaxed text-[#7C7C74]">
        Recupera. Mañana se vuelve a entrenar.
      </p>
    </div>
  )
}
