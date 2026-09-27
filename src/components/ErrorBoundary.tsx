import { Component, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

// Si algo falla al renderizar, muestra el error en pantalla (no negro)
// y deja volver al inicio. Así podemos cazar bugs en el tlf.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }

  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) }
  }
  componentDidCatch(e: unknown) {
    try { console.error('[Tándem]', e) } catch { /* noop */ }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-3xl bg-[#17191d] p-5 text-center">
          <TriangleAlert className="mx-auto h-10 w-10 text-amber-300" strokeWidth={2} />
          <p className="mt-2 font-black">Algo falló al mostrar esto</p>
          <p className="mt-1 break-words rounded-xl bg-black p-2 text-[11px] text-red-300">{this.state.error}</p>
          <p className="mt-1 text-[11px] text-[#7C7C74]">Mándame una captura de este mensaje.</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-3 w-full rounded-2xl bg-[#B2EE37] py-3.5 text-sm font-black uppercase text-black"
          >
            Volver
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
