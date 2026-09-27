import type { Alt, Exercise } from '../types'
import { getPrincipal, type Profile } from './storage'

function altKey(alt: Alt): string {
  return alt.mediaKey ?? `alt:${alt.es}`
}

// Si eligió otra variante en Ajustes, esa pasa a ser la principal.
// El peso queda atado a la variante: volver al plan recupera sus kilos.
export function withPreference(ex: Exercise, profile: Profile): Exercise {
  const slot = ex.mediaKey ?? ex.id
  const chosen = getPrincipal(profile, slot)
  if (!chosen || chosen === slot) return ex
  const alt = (ex.alts ?? []).find(a => altKey(a) === chosen)
  if (!alt) return ex
  const previous: Alt = {
    es: ex.nombre,
    en: ex.nombreEn,
    video: ex.video,
    mediaKey: ex.mediaKey,
  }
  return {
    ...ex,
    nombre: alt.es,
    nombreEn: alt.en,
    video: alt.video ?? ex.video,
    mediaKey: alt.mediaKey ?? chosen,
    demoUrl: alt.video ?? ex.demoUrl,
    alts: [previous, ...(ex.alts ?? []).filter(a => altKey(a) !== chosen)],
  }
}

export function slotKey(ex: Exercise): string {
  return ex.mediaKey ?? ex.id
}

export function variantKey(alt: Alt): string {
  return altKey(alt)
}
