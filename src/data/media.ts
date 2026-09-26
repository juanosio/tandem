// Librería de medios POR EJERCICIO (clave estable).
// El GIF va con el ejercicio a donde sea: si mañana el press inclinado aparece
// en Semana 3 Martes, solo ponle el mismo mediaKey y sale su GIF solo.
// También cubre ALTERNATIVAS (se muestran en miniatura en su fila).
// Archivos en public/media/<slug>.gif|mp4|jpg
export interface ExerciseMediaEntry {
  gif?: string
  video?: string // mp4 propio (pesa menos y se ve más nítido que gif)
  photo?: string
}

export const EXERCISE_MEDIA: Record<string, ExerciseMediaEntry> = {
  // Principales (lote 1)
  'incline-barbell-press': { gif: 'media/incline-barbell-press.gif' },
  'cable-crossover-ladder': { gif: 'media/cable-crossover-ladder.gif' },
  'wide-grip-pullup': { gif: 'media/wide-grip-pullup.gif' },
  'high-cable-lateral-raise': { gif: 'media/high-cable-lateral-raise.gif' },
  'deficit-pendlay-row': { gif: 'media/deficit-pendlay-row.gif' },
  'overhead-cable-triceps-extension': { gif: 'media/overhead-cable-triceps-extension.gif' },
  'bayesian-cable-curl': { gif: 'media/bayesian-cable-curl.gif' },
  // Principales (lote 2)
  'ab-wheel-rollout': { gif: 'media/ab-wheel-rollout.gif' },
  'barbell-bench-press': { gif: 'media/barbell-bench-press.gif' },
  'barbell-rdl': { gif: 'media/barbell-rdl.gif' },
  'bottom-half-db-flye': { gif: 'media/bottom-half-db-flye.gif' },
  'cable-crunch': { gif: 'media/cable-crunch.gif' },
  'cable-triceps-kickback': { gif: 'media/cable-triceps-kickback.gif' },
  'chest-supported-machine-row': { gif: 'media/chest-supported-machine-row.gif' },
  'db-concentration-curl': { gif: 'media/db-concentration-curl.gif' },
  'ez-bar-cable-curl': { gif: 'media/ez-bar-cable-curl.gif' },
  'leg-extension': { gif: 'media/leg-extension.gif' },
  'leg-press': { gif: 'media/leg-press.gif' },
  'lying-leg-curl': { gif: 'media/lying-leg-curl.gif' },
  'lying-leg-raise': { gif: 'media/lying-leg-raise.gif' },
  'machine-abduction': { gif: 'media/machine-abduction.gif' },
  'machine-shoulder-press': { gif: 'media/machine-shoulder-press.gif' },
  'neutral-grip-lat-pulldown': { gif: 'media/neutral-grip-lat-pulldown.gif' },
  'seated-leg-curl': { gif: 'media/seated-leg-curl.gif' },
  'smith-machine-squat': { gif: 'media/smith-machine-squat.gif' },
  'standing-calf-raise': { gif: 'media/standing-calf-raise.gif' },
  // Alternativas (miniatura en su fila; listas si se vuelven principales)
  'bulgarian-split-squat': { gif: 'media/bulgarian-split-squat.gif' },
  'db-rdl': { gif: 'media/db-rdl.gif' },
  'db-shrug': { gif: 'media/db-shrug.gif' },
  'ez-bar-preacher-curl': { gif: 'media/ez-bar-preacher-curl.gif' },
  'high-bar-back-squat': { gif: 'media/high-bar-back-squat.gif' },
  'low-to-high-cable-crossover': { gif: 'media/low-to-high-cable-crossover.gif' },
  'nordic-ham-curl': { gif: 'media/nordic-ham-curl.gif' },
  'one-arm-cable-curl': { gif: 'media/one-arm-cable-curl.gif' },
  'overhead-cable-triceps-extension-rope': { gif: 'media/overhead-cable-triceps-extension-rope.gif' },
  'seated-calf-raise': { gif: 'media/seated-calf-raise.gif' },
  'smith-machine-shrug': { gif: 'media/smith-machine-shrug.gif' },
}
