import type { Alt, Exercise } from '../types'
import { getYoDayExercises } from './semanas'

// Rutina de ella: misma escalera de 12 semanas, sin zancadas ni variantes
// que fuercen la rótula. La intensidad sale del mismo ejercicio (o del
// hueco equivalente) en la rutina de él; los ids llevan prefijo n-.

const UNSAFE = /zancada|lunge|b[uú]lgara|bulgarian|step-up|sissy|n[oó]rdico inverso|reverse nordic|barra alta|high-bar|glute-ham|\bghr\b/i

const LEG_PRESS_ALTS: Alt[] = [
  { es: 'Sentadilla en máquina Smith (pies 10-15 cm adelante)', en: 'Smith Machine Squat', video: 'https://www.youtube.com/watch?v=J2D2J7RO_tA', mediaKey: 'smith-machine-squat' },
  { es: 'Sentadilla hack', en: 'Hack Squat', video: 'https://www.youtube.com/watch?v=TWUnnDK8rck', mediaKey: 'hack-squat' },
]
const GOBLET_ALT: Alt[] = [
  { es: 'Sentadilla goblet', en: 'Goblet Squat', video: 'https://www.youtube.com/watch?v=S2agsLlUSII', mediaKey: 'goblet-squat' },
]
const TUE_PRESS_TECNICA = 'Espalda bien apoyada en el respaldo. Baja controlado y sin que la rodilla se meta hacia dentro. Si cambias a la Smith, adelanta los pies unos 10-15 cm.'

function yo(semana: number, dia: string): Exercise[] {
  return getYoDayExercises(semana, dia)
}

function kneeSafe(ex: Exercise): Exercise {
  const alts = (ex.alts ?? []).filter(a => !UNSAFE.test(`${a.es} ${a.en ?? ''}`))
  const alternativas = alts.length > 0
    ? alts.map(a => a.es).join(' o ')
    : (UNSAFE.test(ex.alternativas) ? '' : ex.alternativas)
  return { ...ex, alts, alternativas }
}

function customize(ex: Exercise): Exercise {
  const next = kneeSafe(ex)
  if (next.mediaKey === 'leg-press') {
    return {
      ...next,
      alts: LEG_PRESS_ALTS,
      alternativas: 'Sentadilla en máquina Smith (pies adelante) o Sentadilla hack',
    }
  }
  if (next.mediaKey === 'leg-extension') {
    return { ...next, alts: GOBLET_ALT, alternativas: 'Sentadilla goblet' }
  }
  if (next.mediaKey === 'machine-abduction' && !next.tecnica.includes('estabilizar la rodilla')) {
    return { ...next, tecnica: `${next.tecnica} Fundamental para estabilizar la rodilla.`.trim() }
  }
  return next
}

function withIntensity(base: Exercise, src: Exercise): Exercise {
  return {
    ...base,
    calentSets: src.calentSets,
    calentDetalle: src.calentDetalle,
    workSets: src.workSets,
    workReps: src.workReps,
    rpe: src.rpe,
    earlyRpe: src.earlyRpe,
    lastSetTech: src.lastSetTech,
    descanso: src.descanso,
  }
}

function place(ex: Exercise, semana: number, p: string, orden: number, dia: Exercise['dia']): Exercise {
  return { ...ex, id: `n-s${semana}-${p}-${orden}`, dia, orden }
}

// Lunes de él: laterales van antes que el remo. Ella hace el remo primero.
const LUN_ORDER = [0, 1, 2, 4, 3, 5, 6]

function lunes(semana: number): Exercise[] {
  const h = yo(semana, 'Lunes')
  return LUN_ORDER.map((src, i) => place(customize(h[src]), semana, 'lun', i + 1, 'Lunes'))
}

function martes(semana: number): Exercise[] {
  const tue = yo(semana, 'Martes')
  const thu = yo(semana, 'Jueves')
  // La prensa ocupa el hueco de fuerza (Smith en S1–S5, zancada en S6+).
  // Se queda la prensa: de la zancada solo se copian series, reps y RPE.
  const press = {
    ...customize(withIntensity(yo(1, 'Jueves')[0], tue[1])),
    tecnica: TUE_PRESS_TECNICA,
  }
  const items = [
    press,
    customize(tue[0]),
    customize(tue[2]),
    customize(thu[3]),
    customize(tue[4]),
    customize(tue[5]),
  ]
  return items.map((ex, i) => place(ex, semana, 'mar', i + 1, 'Martes'))
}

function miercoles(semana: number): Exercise[] {
  return yo(semana, 'Miércoles').map((ex, i) => place(customize(ex), semana, 'mie', i + 1, 'Miércoles'))
}

function jueves(semana: number): Exercise[] {
  return yo(semana, 'Viernes').map((ex, i) => place(customize(ex), semana, 'jue', i + 1, 'Jueves'))
}

function viernes(semana: number): Exercise[] {
  const tue = yo(semana, 'Martes')
  const thu = yo(semana, 'Jueves')
  // S1–S5: prensa. S6+: sentadilla hack (el cambio de él), sin zancada.
  // La extensión ocupa el hueco de las zancadas; goblet queda de alternativa.
  const items = [
    customize(thu[0]),
    customize(thu[1]),
    customize(tue[3]),
    customize(thu[3]),
    customize(thu[4]),
  ]
  return items.map((ex, i) => place(ex, semana, 'vie', i + 1, 'Viernes'))
}

export function getNoviaDayExercises(semana: number, dia: string): Exercise[] {
  if (dia === 'Lunes') return lunes(semana)
  if (dia === 'Martes') return martes(semana)
  if (dia === 'Miércoles') return miercoles(semana)
  if (dia === 'Jueves') return jueves(semana)
  if (dia === 'Viernes') return viernes(semana)
  return []
}
