// Librería de medios POR EJERCICIO (clave estable).
// El GIF va con el ejercicio a donde sea: si mañana el press inclinado aparece
// en Semana 3 Martes, solo ponle el mismo mediaKey y sale su GIF solo.
// Archivos en public/media/<slug>.gif|mp4|jpg
export interface ExerciseMediaEntry {
  gif?: string
  video?: string // mp4 propio (pesa menos y se ve más nítido que gif)
  photo?: string
}

export const EXERCISE_MEDIA: Record<string, ExerciseMediaEntry> = {
  'incline-barbell-press': { gif: 'media/incline-barbell-press.gif' },
  'cable-crossover-ladder': { gif: 'media/cable-crossover-ladder.gif' },
  'wide-grip-pullup': { gif: 'media/wide-grip-pullup.gif' },
  'high-cable-lateral-raise': { gif: 'media/high-cable-lateral-raise.gif' },
  'deficit-pendlay-row': { gif: 'media/deficit-pendlay-row.gif' },
  'overhead-cable-triceps-extension': { gif: 'media/overhead-cable-triceps-extension.gif' },
  'bayesian-cable-curl': { gif: 'media/bayesian-cable-curl.gif' },
}
