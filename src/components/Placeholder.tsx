import type { Pattern } from '../types'

// Muñeco gris placeholder (offline, sin assets). Versión grande estilo referencia.
const HINT: Record<Pattern, string> = {
  press: 'empuje',
  polea: 'polea / apertura',
  pull: 'jalón / dominada',
  remo: 'remo',
  curl: 'curl bíceps',
  pierna: 'pierna',
  aislado: 'aislado',
}

export default function Placeholder({ pattern, big = false }: { pattern: Pattern; big?: boolean }) {
  const barY = pattern === 'pierna' ? 128 : pattern === 'pull' ? 26 : 74
  return (
    <div className="rounded-3xl bg-[#17191d] p-4">
      <svg viewBox="0 0 200 170" className={big ? 'mx-auto h-56 w-56' : 'mx-auto h-32 w-32'} aria-hidden>
        <line x1="24" y1={barY} x2="176" y2={barY} stroke="#3a3d43" strokeWidth="7" strokeLinecap="round" />
        <circle cx="34" cy={barY} r="12" fill="#2c2f36" />
        <circle cx="166" cy={barY} r="12" fill="#2c2f36" />
        <g className="fig-lift">
          <circle cx="100" cy="38" r="15" fill="#7C7C74" />
          <line x1="100" y1="53" x2="100" y2="110" stroke="#7C7C74" strokeWidth="10" strokeLinecap="round" />
          <g className="fig-arms">
            <line x1="100" y1="62" x2="64" y2={barY} stroke="#FCFCFC" strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="62" x2="136" y2={barY} stroke="#FCFCFC" strokeWidth="8" strokeLinecap="round" />
          </g>
          <line x1="100" y1="110" x2="76" y2="152" stroke="#7C7C74" strokeWidth="9" strokeLinecap="round" />
          <line x1="100" y1="110" x2="124" y2="152" stroke="#7C7C74" strokeWidth="9" strokeLinecap="round" />
        </g>
      </svg>
      <p className="mt-1 text-center text-[11px] text-[#7C7C74]">Demo pendiente · patrón {HINT[pattern]} — aquí irá tu video/imagen</p>
    </div>
  )
}
