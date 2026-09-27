import { AlertTriangle } from 'lucide-react'
import type { Exercise } from '../types'
import { EXERCISE_MEDIA } from '../data/media'
import Placeholder from './Placeholder'

// Cadena con tu material (el GIF viaja con el ejercicio vía mediaKey):
// video/mp4 propio > foto propia > GIF de la librería > muñeco gris.
// - Ejercicio que se repite en otra rutina/semana: ponle el mismo mediaKey y listo.
// - Caso puntual distinto: usa ex.mediaMp4 / ex.mediaImage directo en el ejercicio.
export default function ExerciseMedia({ ex, big = false }: { ex: Exercise; big?: boolean }) {
  const lib = (ex.mediaKey && EXERCISE_MEDIA[ex.mediaKey]) || {}
  const mp4 = ex.mediaMp4 || lib.video
  const img = ex.mediaImage || lib.photo || lib.gif

  if (mp4) {
    return (
      <div className="overflow-hidden rounded-3xl bg-[#17191d]">
        <video src={mp4} autoPlay loop muted playsInline className={big ? 'mx-auto h-56' : 'mx-auto h-32'} />
      </div>
    )
  }
  if (img) {
    return (
      <div className="rounded-3xl bg-[#17191d] p-3">
        <img
          src={img}
          alt={ex.nombre}
          loading="lazy"
          className={big ? 'mx-auto h-56 rounded-2xl object-contain' : 'mx-auto h-32 rounded-2xl object-contain'}
        />
        {lib.approx && (
          <p className="mx-auto mt-2 w-fit rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-black text-amber-300">
            <AlertTriangle className="mr-1 inline h-3 w-3" /> GIF referencial — mira el video
          </p>
        )}
      </div>
    )
  }
  return <Placeholder pattern={ex.pattern} big={big} />
}
