export default function RoutineGate({ onHome }: { onHome: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <h2 className="text-3xl font-bold">Todavía no empezaste</h2>
      <p className="mt-2 max-w-xs text-base leading-relaxed text-[#7C7C74]">
        La rutina y el calentamiento aparecen aquí cuando le das a Empezar.
      </p>
      <button onClick={onHome} className="mt-6 min-h-14 rounded-2xl bg-[#B2EE37] px-6 text-lg font-bold uppercase text-black">
        Ir a Inicio
      </button>
    </div>
  )
}
