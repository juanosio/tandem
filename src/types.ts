// Modelo Fase 1 (offline). Basado en rutina_de_entrenamiento.md (31 ejercicios Lun-Vie)
export type TipoPeso = 'redondo' | 'cuadrado' | 'corporal'
export type Pattern = 'press' | 'polea' | 'pull' | 'remo' | 'curl' | 'pierna' | 'aislado'

export interface CalentSet {
  reps: string
  pct: number // % del peso work, ej 50 = 50%
}

export interface Alt {
  es: string
  en?: string
  video?: string // YouTube del ejercicio alternativo
  mediaKey?: string // GIF de la librería (se muestra en miniatura)
}

export interface Exercise {
  id: string
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'
  orden: number
  nombre: string // español (principal)
  nombreEn?: string // nombre original en inglés, se muestra debajo
  video?: string // video principal del ejercicio (YouTube)
  mediaKey?: string // clave en EXERCISE_MEDIA (src/data/media.ts): el GIF viaja con el ejercicio
  alternativas: string // texto legacy "A o B" (fallback)
  alts?: Alt[] // alternativas ricas con video propio
  descanso?: string // ej "3-5 min": mueve el timer de descanso
  rpe?: string // ej "~6": esfuerzo percibido del último set
  earlyRpe?: string // ej "~7": RPE de las series previas cuando hay 2+ (la última va al rpe)
  calentSets: string // "2 a 3" tal cual tu tabla
  calentDetalle: CalentSet[]
  workSets: number
  workReps: string
  tecnica: string
  tipoPeso: TipoPeso
  pattern: Pattern
  demoUrl: string // link externo "Ver cómo se hace" (fallback si no hay video)
  wgerId: number | null // reservado (no se usa: usarás tus propias fotos/videos)
  mediaMp4: string | null // tu video en public/media/*.mp4
  mediaImage?: string | null // tu foto en public/media/*.jpg|png|webp
}

// "3-5 min" -> [180, 300] segs. null si no Parseable.
export function parseDescanso(d?: string): [number, number] | null {
  if (!d) return null
  const m = d.match(/(\d+)\s*(?:-|–|a)\s*(\d+)\s*min/)
  if (m) return [Number(m[1]) * 60, Number(m[2]) * 60]
  const s = d.match(/(\d+)\s*min/)
  if (s) return [Number(s[1]) * 60, Number(s[1]) * 60]
  return null
}
// Punto medio del rango (redondeado a 15s): lo que usa el contador.
export function descansoMedio(d?: string, fallback = 90): number {
  const r = parseDescanso(d)
  if (!r) return fallback
  return Math.round(((r[0] + r[1]) / 2) / 15) * 15
}

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const

export const TIPO_PESO_LABEL: Record<TipoPeso, string> = {
  redondo: 'Disco redondo (barra/manc.)',
  cuadrado: 'Placa máquina (stack)',
  corporal: 'Peso corporal',
}
