import type { CalentSet, Exercise } from '../types'
import { RUTINA } from './rutina'

// Modelo por semanas: la intensidad/cambios van por semana.
// Semana 1 Lunes = datos ricos del usuario (ES+EN, videos, descanso, RPE).
// Resto de días/semanas: fallback a la tabla base hasta que los definamos.
export const SEMANAS_DISPONIBLES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const S1_LUNES: Exercise[] = [
  {
    id: 's1-lun-1', dia: 'Lunes', orden: 1,
    nombre: 'Press inclinado con barra a 45°',
    nombreEn: '45° Incline Barbell Press',
    video: 'https://www.youtube.com/watch?v=vqQ9ok0dEgk',
    alternativas: 'Press inclinado con mancuernas a 45° o Press inclinado en máquina a 45°',
    alts: [
      { es: 'Press inclinado con mancuernas a 45°', en: '45° Dumbbell Incline Press', video: 'https://www.youtube.com/watch?v=p2t9daxLpB8', mediaKey: 'incline-db-press' },
      { es: 'Press inclinado en máquina a 45°', en: '45° Incline Machine Press', video: 'https://www.youtube.com/watch?v=b8fYnZ-usP0', mediaKey: 'incline-machine-press' },
    ],
    descanso: '3-5 min',
    rpe: '~6',
    calentSets: '3', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }],
    workSets: 1, workReps: '6-8',
    tecnica: 'Pausa de 1 segundo abajo en cada repetición manteniendo la tensión en el pecho. Sube explosivo.',
    tipoPeso: 'redondo', pattern: 'press',
    demoUrl: 'https://www.youtube.com/watch?v=vqQ9ok0dEgk',
    wgerId: null, mediaMp4: null, mediaKey: 'incline-barbell-press',
  },
  {
    id: 's1-lun-2', dia: 'Lunes', orden: 2,
    nombre: 'Cruce de poleas en escalera',
    nombreEn: 'Cable Crossover Ladder',
    video: 'https://www.youtube.com/watch?v=0TP9kVcWGic',
    alternativas: 'Máquina contractora (pec deck) o Aperturas con mancuernas (mitad inferior)',
    alts: [
      { es: 'Máquina contractora (pec deck)', en: 'Pec Deck', video: 'https://www.youtube.com/watch?v=CI88L1VNvEs', mediaKey: 'pec-deck' },
      { es: 'Aperturas con mancuernas (mitad inferior)', en: 'Bottom Half DB Flye', video: 'https://www.youtube.com/watch?v=qJzc-iHKGdg', mediaKey: 'bottom-half-db-flye' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Haz una serie con polea baja, una con polea media y una con polea alta. Si solo haces 1-2 series, elige tus 1-2 posiciones favoritas.',
    tipoPeso: 'cuadrado', pattern: 'polea',
    demoUrl: 'https://www.youtube.com/watch?v=0TP9kVcWGic',
    wgerId: null, mediaMp4: null, mediaKey: 'cable-crossover-ladder',
  },
  {
    id: 's1-lun-3', dia: 'Lunes', orden: 3,
    nombre: 'Dominadas con agarre ancho',
    nombreEn: 'Wide Grip Pull-Up',
    video: 'https://www.youtube.com/watch?v=yGnp0HU8BnA',
    alternativas: 'Jalón al pecho con agarre ancho o Jalón con doble agarre (dorsal medio y laterales)',
    alts: [
      { es: 'Jalón al pecho con agarre ancho', en: 'Wide-Grip Lat Pulldown', video: 'https://www.youtube.com/watch?v=IYXRrYXfVLc', mediaKey: 'wide-grip-lat-pulldown' },
      { es: 'Jalón con doble agarre (dorsal medio y laterales)', en: 'Dual-Handle Lat Pulldown', video: 'https://www.youtube.com/watch?v=NwQ5Ch5t5Vk', mediaKey: 'dual-handle-lat-pulldown' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Agarre prono a 1.5x el ancho de hombros. Negativa lenta de 2-3 segundos sintiendo cómo los dorsales se separan al bajar.',
    tipoPeso: 'corporal', pattern: 'pull',
    demoUrl: 'https://www.youtube.com/watch?v=yGnp0HU8BnA',
    wgerId: null, mediaMp4: null, mediaKey: 'wide-grip-pullup',
  },
  {
    id: 's1-lun-4', dia: 'Lunes', orden: 4,
    nombre: 'Elevaciones laterales en polea alta',
    nombreEn: 'High Cable Lateral Raise',
    video: 'https://www.youtube.com/watch?v=MnMux3Wc0Ac',
    alternativas: 'Elevación lateral en polea alta con brazalete o Elevación lateral inclinada con mancuerna',
    alts: [
      { es: 'Elevación lateral en polea alta con brazalete', en: 'High Cable Cuffed Lateral Raise', video: 'https://www.youtube.com/watch?v=8m2jNHBP580', mediaKey: 'high-cable-cuffed-lateral-raise' },
      { es: 'Elevación lateral inclinada con mancuerna', en: 'Lean-In DB Lateral Raise', video: 'https://www.youtube.com/watch?v=BmYuAG2j2co', mediaKey: 'lean-in-db-lateral-raise' },
    ],
    descanso: '1-2 min',
    rpe: '~6',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Aprieta el deltoides lateral para mover el peso, no el trapecio. Baja en 2-4 segundos.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=MnMux3Wc0Ac',
    wgerId: null, mediaMp4: null, mediaKey: 'high-cable-lateral-raise',
  },
  {
    id: 's1-lun-5', dia: 'Lunes', orden: 5,
    nombre: 'Remo Pendlay con déficit',
    nombreEn: 'Deficit Pendlay Row',
    video: 'https://www.youtube.com/watch?v=MmuyHKYCLps',
    alternativas: 'Remo en máquina Smith o Remo con mancuerna',
    alts: [
      { es: 'Remo en máquina Smith', en: 'Smith Machine Row', video: 'https://www.youtube.com/watch?v=Wmivm40AV3Q', mediaKey: 'smith-machine-row' },
      { es: 'Remo con mancuerna', en: 'DB Row', video: 'https://www.youtube.com/watch?v=roKtfQZbxzg', mediaKey: 'db-row' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '6-8',
    tecnica: 'Párate sobre un disco (déficit). Busca un gran estiramiento abajo y toca estómago/pecho en cada repetición.',
    tipoPeso: 'redondo', pattern: 'remo',
    demoUrl: 'https://www.youtube.com/watch?v=MmuyHKYCLps',
    wgerId: null, mediaMp4: null, mediaKey: 'deficit-pendlay-row',
  },
  {
    id: 's1-lun-6', dia: 'Lunes', orden: 6,
    nombre: 'Extensión de tríceps en polea sobre la cabeza (barra)',
    nombreEn: 'Overhead Cable Triceps Extension (Bar)',
    video: 'https://www.youtube.com/watch?v=9_I1PqZAjdA',
    alternativas: 'Extensión de tríceps en polea sobre la cabeza (cuerda) o Rompecráneos con mancuernas',
    alts: [
      { es: 'Extensión de tríceps en polea sobre la cabeza (cuerda)', en: 'Overhead Cable Triceps Extension (Rope)', video: 'https://www.youtube.com/watch?v=GYoUoVNlbGc', mediaKey: 'overhead-cable-triceps-extension-rope' },
      { es: 'Rompecráneos con mancuernas', en: 'DB Skull Crusher', video: 'https://www.youtube.com/watch?v=fbLTzgTKOR8', mediaKey: 'db-skull-crusher' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Opcional: pausa de 0.5-1 segundo en el estiramiento de cada repetición. Sube fuerte.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=9_I1PqZAjdA',
    wgerId: null, mediaMp4: null, mediaKey: 'overhead-cable-triceps-extension',
  },
  {
    id: 's1-lun-7', dia: 'Lunes', orden: 7,
    nombre: 'Curl bayesiano en polea',
    nombreEn: 'Bayesian Cable Curl',
    video: 'https://www.youtube.com/watch?v=CWH5J_7kzjM',
    alternativas: 'Curl bayesiano sentado en polea alta o Curl en banco inclinado con mancuernas',
    alts: [
      { es: 'Curl bayesiano sentado en polea alta', en: 'Seated Super Bayesian High Cable Curl', video: 'https://www.youtube.com/watch?v=jQ9rkfvAbIc', mediaKey: 'seated-bayesian-cable-curl' },
      { es: 'Curl en banco inclinado con mancuernas', en: 'Incline DB Stretch-Curl', video: 'https://www.youtube.com/watch?v=Z0NIYS9nyoQ', mediaKey: 'incline-db-stretch-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Si un brazo es más débil, hazlo a 1 brazo empezando por el débil hasta el RPE indicado, e iguala las reps con el otro (aunque el RPE sea menor). Sin desbalance: ambos brazos a la vez.',
    tipoPeso: 'cuadrado', pattern: 'curl',
    demoUrl: 'https://www.youtube.com/watch?v=CWH5J_7kzjM',
    wgerId: null, mediaMp4: null, mediaKey: 'bayesian-cable-curl',
  },
]

export function getDayExercises(semana: number, dia: string): Exercise[] {
  if (semana === 1 && dia === 'Lunes') return S1_LUNES
  if (semana === 1 && dia === 'Martes') return S1_MARTES
  if (semana === 1 && dia === 'Miércoles') return S1_MIERCOLES
  if (semana === 1 && dia === 'Jueves') return S1_JUEVES
  if (semana === 1 && dia === 'Viernes') return S1_VIERNES
  if (semana === 2 && dia === 'Lunes') return S2_LUNES
  if (semana === 2 && dia === 'Martes') return S2_MARTES
  if (semana === 2 && dia === 'Miércoles') return S2_MIERCOLES
  if (semana === 2 && dia === 'Jueves') return S2_JUEVES
  if (semana === 2 && dia === 'Viernes') return S2_VIERNES
  if (semana === 3 && dia === 'Lunes') return S3_LUNES
  if (semana === 3 && dia === 'Martes') return S3_MARTES
  if (semana === 3 && dia === 'Miércoles') return S3_MIERCOLES
  if (semana === 3 && dia === 'Jueves') return S3_JUEVES
  if (semana === 3 && dia === 'Viernes') return S3_VIERNES
  if (semana === 4 && dia === 'Lunes') return S4_LUNES
  if (semana === 4 && dia === 'Martes') return S4_MARTES
  if (semana === 4 && dia === 'Miércoles') return S4_MIERCOLES
  if (semana === 4 && dia === 'Jueves') return S4_JUEVES
  if (semana === 4 && dia === 'Viernes') return S4_VIERNES
  if (semana === 5 && dia === 'Lunes') return S5_LUNES
  if (semana === 5 && dia === 'Martes') return S5_MARTES
  if (semana === 5 && dia === 'Miércoles') return S5_MIERCOLES
  if (semana === 5 && dia === 'Jueves') return S5_JUEVES
  if (semana === 5 && dia === 'Viernes') return S5_VIERNES
  if (semana === 6 && dia === 'Lunes') return S6_LUNES
  if (semana === 6 && dia === 'Martes') return S6_MARTES
  if (semana === 6 && dia === 'Miércoles') return S6_MIERCOLES
  if (semana === 6 && dia === 'Jueves') return S6_JUEVES
  if (semana === 6 && dia === 'Viernes') return S6_VIERNES
  if (semana === 7 && dia === 'Lunes') return S7_LUNES
  if (semana === 7 && dia === 'Martes') return S7_MARTES
  if (semana === 7 && dia === 'Miércoles') return S7_MIERCOLES
  if (semana === 7 && dia === 'Jueves') return S7_JUEVES
  if (semana === 7 && dia === 'Viernes') return S7_VIERNES
  if (semana === 8 && dia === 'Lunes') return S8_LUNES
  if (semana === 8 && dia === 'Martes') return S8_MARTES
  if (semana === 8 && dia === 'Miércoles') return S8_MIERCOLES
  if (semana === 8 && dia === 'Jueves') return S8_JUEVES
  if (semana === 8 && dia === 'Viernes') return S8_VIERNES
  if (semana === 9 && dia === 'Lunes') return S9_LUNES
  if (semana === 9 && dia === 'Martes') return S9_MARTES
  if (semana === 9 && dia === 'Miércoles') return S9_MIERCOLES
  if (semana === 9 && dia === 'Jueves') return S9_JUEVES
  if (semana === 9 && dia === 'Viernes') return S9_VIERNES
  return RUTINA.filter(e => e.dia === dia).sort((a, b) => a.orden - b.orden)
}

// Intensidad de una semana sobre una ficha base (misma técnica/videos/GIF,
// cambian warm-up, sets, reps, RPE y descanso).
interface Intensity {
  calentSets: string
  calentDetalle: CalentSet[]
  workSets: number
  workReps: string
  rpe: string
  descanso: string
}
const W3 = (base: Exercise, id: string, o: Intensity): Exercise => ({ ...base, id, ...o })
const C3: CalentSet[] = [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }]
const C4: CalentSet[] = [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }]
const C2: CalentSet[] = [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }]
const C1: CalentSet[] = [{ reps: '6-10', pct: 60 }]

const S2_LUNES: Exercise[] = [
  W3(S1_LUNES[0], 's2-lun-1', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '6-8', rpe: '~7', descanso: '3-5 min' }),
  W3(S1_LUNES[1], 's2-lun-2', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_LUNES[2], 's2-lun-3', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '8-10', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_LUNES[3], 's2-lun-4', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_LUNES[4], 's2-lun-5', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '6-8', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_LUNES[5], 's2-lun-6', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_LUNES[6], 's2-lun-7', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
]

// (S2_MARTES movido al final del archivo)

const S1_VIERNES: Exercise[] = [
  {
    id: 's1-vie-1', dia: 'Viernes', orden: 1,
    nombre: 'Press de banca con barra',
    nombreEn: 'Barbell Bench Press',
    video: 'https://www.youtube.com/watch?v=nQL5ieH39sw',
    alternativas: 'Press de pecho en máquina o Press de pecho con mancuernas',
    alts: [
      { es: 'Press de pecho en máquina', en: 'Chest Press Machine', video: 'https://www.youtube.com/watch?v=zDecGJLyVm8', mediaKey: 'machine-chest-press' },
      { es: 'Press de pecho con mancuernas', en: 'Dumbbell Chest Press', video: 'https://www.youtube.com/watch?v=zGXvPjlgVkk', mediaKey: 'dumbbell-chest-press' },
    ],
    descanso: '3-5 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Arquea la espalda cómodo, pausa rápida en el pecho y sube explosivo en cada repetición.',
    tipoPeso: 'redondo', pattern: 'press',
    demoUrl: 'https://www.youtube.com/watch?v=nQL5ieH39sw',
    wgerId: null, mediaMp4: null, mediaKey: 'barbell-bench-press',
  },
  {
    id: 's1-vie-2', dia: 'Viernes', orden: 2,
    nombre: 'Press de hombros en máquina',
    nombreEn: 'Machine Shoulder Press',
    video: 'https://www.youtube.com/watch?v=SCQVmN1gYsk',
    alternativas: 'Press de hombros en polea o Press de hombros sentado con mancuernas',
    alts: [
      { es: 'Press de hombros en polea', en: 'Cable Shoulder Press', video: 'https://www.youtube.com/watch?v=OfjncdW_Vyc', mediaKey: 'cable-shoulder-press' },
      { es: 'Press de hombros sentado con mancuernas', en: 'Seated DB Shoulder Press', video: 'https://www.youtube.com/watch?v=B8PB5RPhTWQ', mediaKey: 'seated-db-shoulder-press' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Que los codos bajen al menos 90°. Conexión mente-músculo con los deltoides. Reps suaves y controladas.',
    tipoPeso: 'cuadrado', pattern: 'press',
    demoUrl: 'https://www.youtube.com/watch?v=SCQVmN1gYsk',
    wgerId: null, mediaMp4: null, mediaKey: 'machine-shoulder-press',
  },
  {
    id: 's1-vie-3', dia: 'Viernes', orden: 3,
    nombre: 'Aperturas con mancuernas (mitad inferior)',
    nombreEn: 'Bottom Half DB Flye',
    video: 'https://www.youtube.com/watch?v=qJzc-iHKGdg',
    alternativas: 'Aperturas en polea sentado (mitad inferior) o Cruce de poleas de abajo hacia arriba',
    alts: [
      { es: 'Aperturas en polea sentado (mitad inferior)', en: 'Bottom Half Seated Cable Flye', video: 'https://www.youtube.com/watch?v=tsJMV9Gxw-o', mediaKey: 'bottom-half-seated-cable-flye' },
      { es: 'Cruce de poleas de abajo hacia arriba', en: 'Low-to-High Cable Crossover', video: 'https://www.youtube.com/watch?v=1LhGmhVFe2Y', mediaKey: 'low-to-high-cable-crossover' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Todas las reps en la mitad inferior del recorrido. Siente un estiramiento profundo en el pecho abajo en cada repetición.',
    tipoPeso: 'redondo', pattern: 'polea',
    demoUrl: 'https://www.youtube.com/watch?v=qJzc-iHKGdg',
    wgerId: null, mediaMp4: null, mediaKey: 'bottom-half-db-flye',
  },
  {
    id: 's1-vie-4', dia: 'Viernes', orden: 4,
    nombre: 'Elevaciones laterales en polea alta',
    nombreEn: 'High Cable Lateral Raise',
    video: 'https://www.youtube.com/watch?v=MnMux3Wc0Ac',
    alternativas: 'Elevación lateral en polea alta con brazalete o Elevación lateral inclinada con mancuerna',
    alts: [
      { es: 'Elevación lateral en polea alta con brazalete', en: 'High Cable Cuffed Lateral Raise', video: 'https://www.youtube.com/watch?v=8m2jNHBP580', mediaKey: 'high-cable-cuffed-lateral-raise' },
      { es: 'Elevación lateral inclinada con mancuerna', en: 'Lean-In DB Lateral Raise', video: 'https://www.youtube.com/watch?v=BmYuAG2j2co', mediaKey: 'lean-in-db-lateral-raise' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Aprieta el deltoides lateral para mover el peso, no el trapecio.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=MnMux3Wc0Ac',
    wgerId: null, mediaMp4: null, mediaKey: 'high-cable-lateral-raise',
  },
  {
    id: 's1-vie-5', dia: 'Viernes', orden: 5,
    nombre: 'Extensión de tríceps en polea sobre la cabeza (barra)',
    nombreEn: 'Overhead Cable Triceps Extension (Bar)',
    video: 'https://www.youtube.com/watch?v=9_I1PqZAjdA',
    alternativas: 'Extensión de tríceps en polea sobre la cabeza (cuerda) o Rompecráneos con mancuernas',
    alts: [
      { es: 'Extensión de tríceps en polea sobre la cabeza (cuerda)', en: 'Overhead Cable Triceps Extension (Rope)', video: 'https://www.youtube.com/watch?v=GYoUoVNlbGc', mediaKey: 'overhead-cable-triceps-extension-rope' },
      { es: 'Rompecráneos con mancuernas', en: 'DB Skull Crusher', video: 'https://www.youtube.com/watch?v=fbLTzgTKOR8', mediaKey: 'db-skull-crusher' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Opcional: pausa de 0.5-1 segundo en el estiramiento de cada repetición. Sube fuerte.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=9_I1PqZAjdA',
    wgerId: null, mediaMp4: null, mediaKey: 'overhead-cable-triceps-extension',
  },
  {
    id: 's1-vie-6', dia: 'Viernes', orden: 6,
    nombre: 'Patada de tríceps en polea',
    nombreEn: 'Cable Triceps Kickback',
    video: 'https://www.youtube.com/watch?v=oRxTKRtP8RE',
    alternativas: 'Patada de tríceps con mancuerna o Fondos en banco',
    alts: [
      { es: 'Patada de tríceps con mancuerna', en: 'DB Triceps Kickback', video: 'https://www.youtube.com/watch?v=YdUUYFgpA7g', mediaKey: 'db-triceps-kickback' },
      { es: 'Fondos en banco', en: 'Bench Dip', video: 'https://www.youtube.com/watch?v=3CaIq8jZe18', mediaKey: 'bench-dip' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '12-15',
    tecnica: 'Dos formas: erguido o inclinado, elige la más cómoda. Lo importante: en el apretón total el hombro queda detrás del torso.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=oRxTKRtP8RE',
    wgerId: null, mediaMp4: null, mediaKey: 'cable-triceps-kickback',
  },
  {
    id: 's1-vie-7', dia: 'Viernes', orden: 7,
    nombre: 'Elevación de piernas acostado',
    nombreEn: 'Lying Leg Raise',
    video: 'https://www.youtube.com/watch?v=w86Ph4iQgBM',
    alternativas: 'Elevación de piernas colgado o Vela modificada',
    alts: [
      { es: 'Elevación de piernas colgado', en: 'Hanging Leg Raise', video: 'https://www.youtube.com/watch?v=rGqwkinWqYI', mediaKey: 'hanging-leg-raise' },
      { es: 'Vela modificada', en: 'Modified Candlestick', video: 'https://www.youtube.com/watch?v=-XVRl8KU7x0', mediaKey: 'modified-candlestick' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '10-20',
    tecnica: 'Hazlo lento, con la espalda baja pegada al suelo en toda la serie.',
    tipoPeso: 'corporal', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=w86Ph4iQgBM',
    wgerId: null, mediaMp4: null, mediaKey: 'lying-leg-raise',
  },
]

const S1_JUEVES: Exercise[] = [
  {
    id: 's1-jue-1', dia: 'Jueves', orden: 1,
    nombre: 'Prensa de piernas',
    nombreEn: 'Leg Press',
    video: 'https://www.youtube.com/watch?v=1yKAQLVV_XI',
    alternativas: 'Zancada en máquina Smith o Zancadas caminando con mancuernas',
    alts: [
      { es: 'Zancada en máquina Smith', en: 'Smith Machine Lunge', video: 'https://www.youtube.com/watch?v=SEjKxJGg_C8', mediaKey: 'smith-machine-lunge' },
      { es: 'Zancadas caminando con mancuernas', en: 'DB Walking Lunge', video: 'https://www.youtube.com/watch?v=BC_eDtrB-M4', mediaKey: 'db-walking-lunge' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Pies abajo en la plataforma para más cuádriceps. Baja lo más profundo que puedas sin redondear la espalda. Controla la negativa con ligera pausa abajo.',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=1yKAQLVV_XI',
    wgerId: null, mediaMp4: null, mediaKey: 'leg-press',
  },
  {
    id: 's1-jue-2', dia: 'Jueves', orden: 2,
    nombre: 'Curl femoral sentado',
    nombreEn: 'Seated Leg Curl',
    video: 'https://www.youtube.com/watch?v=yv0aAY7M1mk',
    alternativas: 'Curl de piernas tumbado o Curl nórdico de isquios',
    alts: [
      { es: 'Curl de piernas tumbado', en: 'Lying Leg Curl', video: 'https://www.youtube.com/watch?v=sX4tGtcc62k', mediaKey: 'lying-leg-curl' },
      { es: 'Curl nórdico de isquios', en: 'Nordic Ham Curl', video: 'https://www.youtube.com/watch?v=fzpYiRtzmFA', mediaKey: 'nordic-ham-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Inclínate al frente sobre la máquina para lograr el máximo estiramiento de los isquios.',
    tipoPeso: 'cuadrado', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=yv0aAY7M1mk',
    wgerId: null, mediaMp4: null, mediaKey: 'seated-leg-curl',
  },
  {
    id: 's1-jue-3', dia: 'Jueves', orden: 3,
    nombre: 'Zancadas caminando con mancuernas',
    nombreEn: 'DB Walking Lunge',
    video: 'https://www.youtube.com/watch?v=BC_eDtrB-M4',
    alternativas: 'Step-up con mancuernas o Sentadilla goblet',
    alts: [
      { es: 'Step-up con mancuernas', en: 'DB Step-Up', video: 'https://www.youtube.com/watch?v=3FNfi_PrP9Y', mediaKey: 'db-step-up' },
      { es: 'Sentadilla goblet', en: 'Goblet Squat', video: 'https://www.youtube.com/watch?v=S2agsLlUSII', mediaKey: 'goblet-squat' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Pasos medios. Minimiza el impulso de la pierna trasera al subir.',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=BC_eDtrB-M4',
    wgerId: null, mediaMp4: null, mediaKey: 'db-walking-lunge',
  },
  {
    id: 's1-jue-4', dia: 'Jueves', orden: 4,
    nombre: 'Abducción en máquina',
    nombreEn: 'Machine Abduction',
    video: 'https://www.youtube.com/watch?v=pozooPg6PBE',
    alternativas: 'Abducción de cadera en polea o Caminata lateral con banda',
    alts: [
      { es: 'Abducción de cadera en polea', en: 'Cable Hip Abduction', video: 'https://www.youtube.com/watch?v=552L1K3Rb_Q', mediaKey: 'cable-hip-abduction' },
      { es: 'Caminata lateral con banda', en: 'Lateral Band Walk', video: 'https://www.youtube.com/watch?v=sOYvvFPYdsU', mediaKey: 'lateral-band-walk' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Si puedes, usa almohadillas para más recorrido. Inclínate al frente agarrando los rieles para estirar más los glúteos.',
    tipoPeso: 'cuadrado', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=pozooPg6PBE',
    wgerId: null, mediaMp4: null, mediaKey: 'machine-abduction',
  },
  {
    id: 's1-jue-5', dia: 'Jueves', orden: 5,
    nombre: 'Elevación de pantorrillas de pie',
    nombreEn: 'Standing Calf Raise',
    video: 'https://www.youtube.com/watch?v=6lR2JdxUh7w',
    alternativas: 'Elevación de pantorrillas sentado o Pantorrillas en prensa',
    alts: [
      { es: 'Elevación de pantorrillas sentado', en: 'Seated Calf Raise', video: 'https://www.youtube.com/watch?v=6pfj0G7VKdM', mediaKey: 'seated-calf-raise' },
      { es: 'Pantorrillas en prensa', en: 'Leg Press Calf Press', video: 'https://www.youtube.com/watch?v=S6DTPNZ_-F4', mediaKey: 'leg-press-calf-press' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Pausa de 1-2 segundos abajo en cada repetición. Rueda el tobillo sobre la bola del pie en vez de solo subirte a las puntas.',
    tipoPeso: 'cuadrado', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=6lR2JdxUh7w',
    wgerId: null, mediaMp4: null, mediaKey: 'standing-calf-raise',
  },
]

const S1_MIERCOLES: Exercise[] = [
  {
    id: 's1-mie-1', dia: 'Miércoles', orden: 1,
    nombre: 'Jalón al pecho con agarre neutro (con parciales)',
    nombreEn: 'Neutral-Grip Lat Pulldown w/ Integrated Partials',
    video: 'https://www.youtube.com/watch?v=lA4_1F9EAFU',
    alternativas: 'Dominadas con agarre neutro o Jalón con doble agarre (dorsal medio y laterales)',
    alts: [
      { es: 'Dominadas con agarre neutro', en: 'Neutral-Grip Pull-Up', video: 'https://www.youtube.com/watch?v=b0ypSz63UGo', mediaKey: 'neutral-grip-pullup' },
      { es: 'Jalón con doble agarre (dorsal medio y laterales)', en: 'Dual-Handle Lat Pulldown', video: 'https://www.youtube.com/watch?v=NwQ5Ch5t5Vk', mediaKey: 'dual-handle-lat-pulldown' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Jala con el agarre más al frente de ti, como una mezcla entre pullover y jalón. Siente los dorsales trabajando más que el peso que mueves.',
    tipoPeso: 'cuadrado', pattern: 'pull',
    demoUrl: 'https://www.youtube.com/watch?v=lA4_1F9EAFU',
    wgerId: null, mediaMp4: null, mediaKey: 'neutral-grip-lat-pulldown',
  },
  {
    id: 's1-mie-2', dia: 'Miércoles', orden: 2,
    nombre: 'Remo en máquina con apoyo al pecho',
    nombreEn: 'Chest-Supported Machine Row',
    video: 'https://www.youtube.com/watch?v=ijsSiWSzYw0',
    alternativas: 'Remo en barra T con apoyo al pecho o Remo con mancuernas en banco inclinado con apoyo',
    alts: [
      { es: 'Remo en barra T con apoyo al pecho', en: 'Chest-Supported T-Bar Row', video: 'https://www.youtube.com/watch?v=q8qlHwcuOtc', mediaKey: 'chest-supported-tbar-row' },
      { es: 'Remo con mancuernas en banco inclinado con apoyo al pecho', en: 'Chest-Supported Incline DB Row', video: 'https://www.youtube.com/watch?v=okCWuhxJEvw', mediaKey: 'chest-supported-incline-db-row' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Abre los codos a ~45° y aprieta fuerte los omóplatos arriba en cada repetición.',
    tipoPeso: 'cuadrado', pattern: 'remo',
    demoUrl: 'https://www.youtube.com/watch?v=ijsSiWSzYw0',
    wgerId: null, mediaMp4: null, mediaKey: 'chest-supported-machine-row',
  },
  {
    id: 's1-mie-3', dia: 'Miércoles', orden: 3,
    nombre: 'Vuelos posteriores en polea a 45° a 1 brazo',
    nombreEn: '1-Arm 45° Cable Rear Delt Flye',
    video: 'https://www.youtube.com/watch?v=6G5DmVaocGM',
    alternativas: 'Face pull con cuerda o Contractora inversa (pec deck inverso)',
    alts: [
      { es: 'Face pull con cuerda', en: 'Rope Face Pull', video: 'https://www.youtube.com/watch?v=GhrVM-jPIEA', mediaKey: 'rope-face-pull' },
      { es: 'Contractora inversa (pec deck inverso)', en: 'Reverse Pec Deck', video: 'https://www.youtube.com/watch?v=Y8fb_rtEU_4', mediaKey: 'reverse-pec-deck' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Pausa 1-2 segundos apretando en cada repetición. ¡Contrae fuerte los deltoides posteriores!',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=6G5DmVaocGM',
    wgerId: null, mediaMp4: null, mediaKey: 'cable-rear-delt-flye',
  },
  {
    id: 's1-mie-4', dia: 'Miércoles', orden: 4,
    nombre: 'Encogimientos en máquina',
    nombreEn: 'Machine Shrug',
    video: 'https://www.youtube.com/watch?v=ua0XuKwKQ9M',
    alternativas: 'Encogimiento en polea con pausa o Encogimientos con mancuernas',
    alts: [
      { es: 'Encogimiento en polea con pausa', en: 'Cable Paused Shrug-In', video: 'https://www.youtube.com/watch?v=Hy6f1Lz_PiA', mediaKey: 'cable-paused-shrug-in' },
      { es: 'Encogimientos con mancuernas', en: 'DB Shrug', video: 'https://www.youtube.com/watch?v=moFqLlptX7Q', mediaKey: 'db-shrug' },
    ],
    descanso: '1-2 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }, { reps: '3-4', pct: 85 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Pausa breve arriba y abajo del recorrido. ¡Piensa en subir los hombros hacia las orejas!',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=ua0XuKwKQ9M',
    wgerId: null, mediaMp4: null, mediaKey: 'machine-shrug',
  },
  {
    id: 's1-mie-5', dia: 'Miércoles', orden: 5,
    nombre: 'Curl en polea con barra EZ',
    nombreEn: 'EZ Bar Cable Curl',
    video: 'https://www.youtube.com/watch?v=ck1zjNTnFew',
    alternativas: 'Curl con barra EZ libre (barra Z, no recta) o Curl con mancuernas',
    alts: [
      { es: 'Curl con barra EZ libre (barra Z/serpiente, NO recta)', en: 'EZ Bar Curl', video: 'https://www.youtube.com/watch?v=WMrgn4GG7mI', mediaKey: 'ez-bar-curl' },
      { es: 'Curl con mancuernas', en: 'DB Curl', video: 'https://www.youtube.com/watch?v=XxGCRSJmgwY', mediaKey: 'db-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '10-12',
    tecnica: 'Polea en la posición más baja. Tensión constante en el bíceps, reps lentas y controladas. OJO: barra EZ = la de forma de Z/serpiente, no la recta.',
    tipoPeso: 'cuadrado', pattern: 'curl',
    demoUrl: 'https://www.youtube.com/watch?v=ck1zjNTnFew',
    wgerId: null, mediaMp4: null, mediaKey: 'ez-bar-cable-curl',
  },
  {
    id: 's1-mie-6', dia: 'Miércoles', orden: 6,
    nombre: 'Curl predicador en máquina',
    nombreEn: 'Machine Preacher Curl',
    video: 'https://www.youtube.com/watch?v=R2iUnBxFtis',
    alternativas: 'Curl predicador con barra EZ (barra Z, no recta) o Curl predicador con mancuernas',
    alts: [
      { es: 'Curl predicador con barra EZ (barra Z/serpiente, NO recta)', en: 'EZ Bar Preacher Curl', video: 'https://www.youtube.com/watch?v=Dn7qgf9iSH8', mediaKey: 'ez-bar-preacher-curl' },
      { es: 'Curl predicador con mancuernas', en: 'DB Preacher Curl', video: 'https://www.youtube.com/watch?v=WTkQLAethtg', mediaKey: 'db-preacher-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '12-15',
    tecnica: 'Reps suaves y controladas. Conexión mente-músculo con el bíceps. Si usas barra EZ recuerda: la de forma de Z/serpiente, no la recta.',
    tipoPeso: 'cuadrado', pattern: 'curl',
    demoUrl: 'https://www.youtube.com/watch?v=R2iUnBxFtis',
    wgerId: null, mediaMp4: null, mediaKey: 'machine-preacher-curl',
  },
]

const S1_MARTES: Exercise[] = [
  {
    id: 's1-mar-1', dia: 'Martes', orden: 1,
    nombre: 'Curl de piernas tumbado',
    nombreEn: 'Lying Leg Curl',
    video: 'https://www.youtube.com/watch?v=sX4tGtcc62k',
    alternativas: 'Curl femoral sentado o Curl nórdico de isquios',
    alts: [
      { es: 'Curl femoral sentado', en: 'Seated Leg Curl', video: 'https://www.youtube.com/watch?v=yv0aAY7M1mk', mediaKey: 'seated-leg-curl' },
      { es: 'Curl nórdico de isquios', en: 'Nordic Ham Curl', video: 'https://www.youtube.com/watch?v=fzpYiRtzmFA', mediaKey: 'nordic-ham-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Ajusta la máquina para lograr el mayor estiramiento posible abajo. Evita que los glúteos se despeguen del banco al doblar las piernas.',
    tipoPeso: 'cuadrado', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=sX4tGtcc62k',
    wgerId: null, mediaMp4: null, mediaKey: 'lying-leg-curl',
  },
  {
    id: 's1-mar-2', dia: 'Martes', orden: 2,
    nombre: 'Sentadilla en máquina Smith',
    nombreEn: 'Smith Machine Squat',
    video: 'https://www.youtube.com/watch?v=J2D2J7RO_tA',
    alternativas: 'Sentadilla búlgara o Sentadilla trasera con barra alta',
    alts: [
      { es: 'Sentadilla búlgara', en: 'Bulgarian Split Squat', video: 'https://www.youtube.com/watch?v=htDXu61MPio', mediaKey: 'bulgarian-split-squat' },
      { es: 'Sentadilla trasera con barra alta', en: 'High-Bar Back Squat', video: 'https://www.youtube.com/watch?v=V-B_Y-OvOTQ', mediaKey: 'high-bar-back-squat' },
    ],
    descanso: '3-5 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }],
    workSets: 1, workReps: '6-8',
    tecnica: 'Ya bajo la barra, coloca los pies como en una sentadilla normal y adelántalos ~7-15 cm. Te recargarás un poco contra la barra para una sentadilla más vertical con más tensión en cuádriceps. Si los talones se levantan abajo, adelanta más los pies. Si sientes que resbalan o la espalda baja se redondea, retrásalos un poco.',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=J2D2J7RO_tA',
    wgerId: null, mediaMp4: null, mediaKey: 'smith-machine-squat',
  },
  {
    id: 's1-mar-3', dia: 'Martes', orden: 3,
    nombre: 'Peso muerto rumano con barra',
    nombreEn: 'Barbell RDL',
    video: 'https://www.youtube.com/watch?v=ggFtGGYobE4',
    alternativas: 'Peso muerto rumano con mancuernas o Peso muerto rumano con agarre abierto (snatch)',
    alts: [
      { es: 'Peso muerto rumano con mancuernas', en: 'DB RDL', video: 'https://www.youtube.com/watch?v=VRwSgUoj7uI', mediaKey: 'db-rdl' },
      { es: 'Peso muerto rumano con agarre abierto (snatch)', en: 'Snatch-Grip RDL', video: 'https://www.youtube.com/watch?v=b8fmEaXHapU', mediaKey: 'snatch-grip-rdl' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }],
    workSets: 1, workReps: '6-8',
    tecnica: 'Para mantener la tensión en los isquios, sube solo hasta ~75% del bloqueo en cada repetición (quédate en los 3/4 bajos del recorrido).',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=ggFtGGYobE4',
    wgerId: null, mediaMp4: null, mediaKey: 'barbell-rdl',
  },
  {
    id: 's1-mar-4', dia: 'Martes', orden: 4,
    nombre: 'Extensión de cuádriceps en máquina',
    nombreEn: 'Leg Extension',
    video: 'https://www.youtube.com/watch?v=uFbNtqP966A',
    alternativas: 'Nórdico inverso o Sentadilla sissy',
    alts: [
      { es: 'Nórdico inverso', en: 'Reverse Nordic', video: 'https://www.youtube.com/watch?v=D-kqUKEQZZ0', mediaKey: 'reverse-nordic' },
      { es: 'Sentadilla sissy', en: 'Sissy Squat', video: 'https://www.youtube.com/watch?v=eWAjlO4FWPQ', mediaKey: 'sissy-squat' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Echa el asiento todo lo atrás que puedas sin incomodidad. Agarra las asas con fuerza para pegar los glúteos al asiento. Negativa de 2-3 segundos sintiendo cómo los cuádriceps se separan.',
    tipoPeso: 'cuadrado', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=uFbNtqP966A',
    wgerId: null, mediaMp4: null, mediaKey: 'leg-extension',
  },
  {
    id: 's1-mar-5', dia: 'Martes', orden: 5,
    nombre: 'Elevación de pantorrillas de pie',
    nombreEn: 'Standing Calf Raise',
    video: 'https://www.youtube.com/watch?v=6lR2JdxUh7w',
    alternativas: 'Elevación de pantorrillas sentado o Pantorrillas en prensa',
    alts: [
      { es: 'Elevación de pantorrillas sentado', en: 'Seated Calf Raise', video: 'https://www.youtube.com/watch?v=6pfj0G7VKdM', mediaKey: 'seated-calf-raise' },
      { es: 'Pantorrillas en prensa', en: 'Leg Press Calf Press', video: 'https://www.youtube.com/watch?v=S6DTPNZ_-F4', mediaKey: 'leg-press-calf-press' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: [{ reps: '6-10', pct: 50 }, { reps: '4-6', pct: 70 }],
    workSets: 1, workReps: '6-8',
    tecnica: 'Pausa de 1-2 segundos abajo en cada repetición. En vez de solo subirte a las puntas, piensa en rodar el tobillo sobre la bola del pie.',
    tipoPeso: 'cuadrado', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=6lR2JdxUh7w',
    wgerId: null, mediaMp4: null, mediaKey: 'standing-calf-raise',
  },
  {
    id: 's1-mar-6', dia: 'Martes', orden: 6,
    nombre: 'Crunch abdominal en polea',
    nombreEn: 'Cable Crunch',
    video: 'https://www.youtube.com/watch?v=epBrpaGHMcg',
    alternativas: 'Crunch declinado con peso o Crunch en máquina',
    alts: [
      { es: 'Crunch declinado con peso', en: 'Weighted Decline Crunch', video: 'https://www.youtube.com/watch?v=ZheUsKqU81M', mediaKey: 'weighted-decline-crunch' },
      { es: 'Crunch en máquina', en: 'Machine Crunch', video: 'https://www.youtube.com/watch?v=K2yKEoazT3g', mediaKey: 'machine-crunch' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: [{ reps: '6-10', pct: 60 }],
    workSets: 1, workReps: '8-10',
    tecnica: 'Redondea la espalda baja al contraer. Mantén la conexión mente-músculo con el abdomen.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=epBrpaGHMcg',
    wgerId: null, mediaMp4: null, mediaKey: 'cable-crunch',
  },
]

// Overrides Semana 2 Martes (misma ficha, solo intensidad).
const S2_MARTES: Exercise[] = [
  W3(S1_MARTES[0], 's2-mar-1', { calentSets: '2', calentDetalle: C2, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_MARTES[1], 's2-mar-2', { calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }], workSets: 1, workReps: '6-8', rpe: '~7', descanso: '3-5 min' }),
  W3(S1_MARTES[2], 's2-mar-3', { calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }], workSets: 1, workReps: '6-8', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_MARTES[3], 's2-mar-4', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_MARTES[4], 's2-mar-5', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '6-8', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_MARTES[5], 's2-mar-6', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '8-10', rpe: '~8', descanso: '1-2 min' }),
]

// Overrides Semana 2 Miércoles (misma ficha, solo intensidad).
const S2_MIERCOLES: Exercise[] = [
  W3(S1_MIERCOLES[0], 's2-mie-1', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '8-10', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_MIERCOLES[1], 's2-mie-2', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '8-10', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_MIERCOLES[2], 's2-mie-3', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_MIERCOLES[3], 's2-mie-4', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '10-12', rpe: '~7', descanso: '1-2 min' }),
  W3(S1_MIERCOLES[4], 's2-mie-5', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_MIERCOLES[5], 's2-mie-6', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '12-15', rpe: '~8', descanso: '1-2 min' }),
]

// Overrides Semana 2 Jueves (misma ficha, solo intensidad).
const S2_JUEVES: Exercise[] = [
  W3(S1_JUEVES[0], 's2-jue-1', { calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }], workSets: 1, workReps: '8-10', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_JUEVES[1], 's2-jue-2', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_JUEVES[2], 's2-jue-3', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '8-10', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_JUEVES[3], 's2-jue-4', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_JUEVES[4], 's2-jue-5', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
]

// Overrides Semana 2 Viernes (misma ficha, solo intensidad).
const S2_VIERNES: Exercise[] = [
  W3(S1_VIERNES[0], 's2-vie-1', { calentSets: '2 a 4', calentDetalle: [{ reps: '6-10', pct: 45 }, { reps: '4-6', pct: 60 }, { reps: '3-5', pct: 75 }, { reps: '2-4', pct: 85 }], workSets: 1, workReps: '8-10', rpe: '~7', descanso: '3-5 min' }),
  W3(S1_VIERNES[1], 's2-vie-2', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '8-10', rpe: '~7', descanso: '2-3 min' }),
  W3(S1_VIERNES[2], 's2-vie-3', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_VIERNES[3], 's2-vie-4', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_VIERNES[4], 's2-vie-5', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '10-12', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_VIERNES[5], 's2-vie-6', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '12-15', rpe: '~8', descanso: '1-2 min' }),
  W3(S1_VIERNES[6], 's2-vie-7', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-20', rpe: '~8', descanso: '1-2 min' }),
]

// Semana 3: mismas fichas e intensidad que S2, pero 2 working sets.
// La 1ª serie va al Early Set RPE (~7) y la última al RPE final.
const S3 = (base: Exercise[], dia: string, semana: number): Exercise[] =>
  base.map((e, i) => ({ ...e, id: `s${semana}-${dia}-${i + 1}`, workSets: 2, earlyRpe: '~7' }));

const S3_LUNES = S3(S2_LUNES, 'lun', 3)
const S3_MARTES = S3(S2_MARTES, 'mar', 3)
const S3_MIERCOLES = S3(S2_MIERCOLES, 'mie', 3)
const S3_JUEVES = S3(S2_JUEVES, 'jue', 3)
const S3_VIERNES = S3(S2_VIERNES, 'vie', 3)

// Semanas 4 y 5: copia exacta de la Semana 3 (mismas fichas, misma intensidad).
const COPY = (base: Exercise[], semana: number, p: string): Exercise[] =>
  base.map((e, i) => ({ ...e, id: `s${semana}-${p}-${i + 1}` }));

const S4_LUNES = COPY(S3_LUNES, 4, 'lun')
const S4_MARTES = COPY(S3_MARTES, 4, 'mar')
const S4_MIERCOLES = COPY(S3_MIERCOLES, 4, 'mie')
const S4_JUEVES = COPY(S3_JUEVES, 4, 'jue')
const S4_VIERNES = COPY(S3_VIERNES, 4, 'vie')
const S5_LUNES = COPY(S3_LUNES, 5, 'lun')
const S5_MARTES = COPY(S3_MARTES, 5, 'mar')
const S5_MIERCOLES = COPY(S3_MIERCOLES, 5, 'mie')
const S5_JUEVES = COPY(S3_JUEVES, 5, 'jue')
const S5_VIERNES = COPY(S3_VIERNES, 5, 'vie')

// Semana 6: vuelve a 1 working set, sin Early RPE. Varios principales son
// alternativas promovidas (reutilizan su video) + fichas nuevas.
const S6_LUNES: Exercise[] = [
  {
    id: 's6-lun-1', dia: 'Lunes', orden: 1,
    nombre: 'Press inclinado con mancuernas a 45°',
    nombreEn: '45° Incline DB Press',
    video: 'https://www.youtube.com/watch?v=p2t9daxLpB8',
    alternativas: 'Press inclinado con barra a 45° o Press inclinado en máquina a 45°',
    alts: [
      { es: 'Press inclinado con barra a 45°', en: '45° Incline Barbell Press', video: 'https://www.youtube.com/watch?v=vqQ9ok0dEgk', mediaKey: 'incline-barbell-press' },
      { es: 'Press inclinado en máquina a 45°', en: '45° Incline Machine Press', video: 'https://www.youtube.com/watch?v=b8fYnZ-usP0', mediaKey: 'incline-machine-press' },
    ],
    descanso: '3-5 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: C3,
    workSets: 1, workReps: '8-10',
    tecnica: 'Pausa de 1 segundo abajo en cada repetición manteniendo la tensión en el pecho. Sube explosivo.',
    tipoPeso: 'redondo', pattern: 'press',
    demoUrl: 'https://www.youtube.com/watch?v=p2t9daxLpB8',
    wgerId: null, mediaMp4: null, mediaKey: 'incline-db-press',
  },
  {
    id: 's6-lun-2', dia: 'Lunes', orden: 2,
    nombre: 'Contractora de pecho (pec deck)',
    nombreEn: 'Pec Deck',
    video: 'https://www.youtube.com/watch?v=CI88L1VNvEs',
    alternativas: 'Cruce de poleas en escalera o Aperturas con mancuernas (mitad inferior)',
    alts: [
      { es: 'Cruce de poleas en escalera', en: 'Cable Crossover Ladder', video: 'https://www.youtube.com/watch?v=0TP9kVcWGic', mediaKey: 'cable-crossover-ladder' },
      { es: 'Aperturas con mancuernas (mitad inferior)', en: 'Bottom-Half DB Flye', video: 'https://www.youtube.com/watch?v=qJzc-iHKGdg', mediaKey: 'bottom-half-db-flye' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: C2,
    workSets: 1, workReps: '10-12',
    tecnica: 'Junta los codos, no las manos. Aprieta el pecho en cada repetición.',
    tipoPeso: 'cuadrado', pattern: 'polea',
    demoUrl: 'https://www.youtube.com/watch?v=CI88L1VNvEs',
    wgerId: null, mediaMp4: null, mediaKey: 'pec-deck',
  },
  {
    id: 's6-lun-3', dia: 'Lunes', orden: 3,
    nombre: 'Jalón con doble agarre',
    nombreEn: 'Dual-Handle Lat Pulldown',
    video: 'https://www.youtube.com/watch?v=NwQ5Ch5t5Vk',
    alternativas: 'Jalón al pecho con agarre ancho o Dominadas con agarre ancho',
    alts: [
      { es: 'Jalón al pecho con agarre ancho', en: 'Wide-Grip Lat Pulldown', video: 'https://www.youtube.com/watch?v=IYXRrYXfVLc', mediaKey: 'wide-grip-lat-pulldown' },
      { es: 'Dominadas con agarre ancho', en: 'Wide-Grip Pull-Up', video: 'https://www.youtube.com/watch?v=yGnp0HU8BnA', mediaKey: 'wide-grip-pullup' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '1 a 2', calentDetalle: C2,
    workSets: 1, workReps: '10-12',
    tecnica: 'Inclínate atrás ~15° y baja los codos apretando los omóplatos. Debe sentirse mezcla de dorsales y trapecio medio.',
    tipoPeso: 'cuadrado', pattern: 'pull',
    demoUrl: 'https://www.youtube.com/watch?v=NwQ5Ch5t5Vk',
    wgerId: null, mediaMp4: null, mediaKey: 'dual-handle-lat-pulldown',
  },
  W3(S1_LUNES[3], 's6-lun-4', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~6', descanso: '1-2 min' }),
  {
    id: 's6-lun-5', dia: 'Lunes', orden: 5,
    nombre: 'Remo en máquina Smith',
    nombreEn: 'Smith Machine Row',
    video: 'https://www.youtube.com/watch?v=Wmivm40AV3Q',
    alternativas: 'Remo Pendlay con déficit o Remo con mancuerna a 1 brazo',
    alts: [
      { es: 'Remo Pendlay con déficit', en: 'Pendlay Deficit Row', video: 'https://www.youtube.com/watch?v=MmuyHKYCLps', mediaKey: 'deficit-pendlay-row' },
      { es: 'Remo con mancuerna a 1 brazo', en: 'Single-Arm DB Row', video: 'https://www.youtube.com/watch?v=roKtfQZbxzg', mediaKey: 'db-row' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '1 a 2', calentDetalle: C2,
    workSets: 1, workReps: '8-10',
    tecnica: 'Aprieta los omóplatos juntos manteniendo los codos a ~45°.',
    tipoPeso: 'redondo', pattern: 'remo',
    demoUrl: 'https://www.youtube.com/watch?v=Wmivm40AV3Q',
    wgerId: null, mediaMp4: null, mediaKey: 'smith-machine-row',
  },
  W3(S1_LUNES[5], 's6-lun-6', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '10-12', rpe: '~7', descanso: '1-2 min' }),
  W3(S1_LUNES[6], 's6-lun-7', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '10-12', rpe: '~7', descanso: '1-2 min' }),
]

const S6_MARTES: Exercise[] = [
  W3(S1_MARTES[0], 's6-mar-1', { calentSets: '2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~7', descanso: '1-2 min' }),
  {
    id: 's6-mar-2', dia: 'Martes', orden: 2,
    nombre: 'Zancada estática en Smith con pie delantero elevado',
    nombreEn: 'Smith Machine Static Lunge w/ Elevated Front Foot',
    video: 'https://www.youtube.com/watch?v=GOqHdmshRKY',
    alternativas: 'Sentadilla búlgara o Sentadilla trasera con barra alta',
    alts: [
      { es: 'Sentadilla búlgara', en: 'Bulgarian Split Squat', video: 'https://www.youtube.com/watch?v=htDXu61MPio', mediaKey: 'bulgarian-split-squat' },
      { es: 'Sentadilla trasera con barra alta', en: 'High-Bar Back Squat', video: 'https://www.youtube.com/watch?v=V-B_Y-OvOTQ', mediaKey: 'high-bar-back-squat' },
    ],
    descanso: '3-5 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: C4,
    workSets: 1, workReps: '8-10',
    tecnica: 'Eleva el pie delantero en un cajón bajo. Minimiza el aporte de la pierna trasera.',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=GOqHdmshRKY',
    wgerId: null, mediaMp4: null, mediaKey: 'smith-static-lunge-elevated',
  },
  {
    id: 's6-mar-3', dia: 'Martes', orden: 3,
    nombre: 'Hiperextensión a 45° con peso',
    nombreEn: 'Weighted 45 Degree Hyperextension',
    video: 'https://www.youtube.com/watch?v=lEeCPhlFZig',
    alternativas: 'Elevación glúteo-isquio (GHR) o Pull through en polea',
    alts: [
      { es: 'Elevación glúteo-isquio (GHR)', en: 'Glute-Ham Raise', video: 'https://www.youtube.com/watch?v=9ksG-O0ZUto', mediaKey: 'glute-ham-raise' },
      { es: 'Pull through en polea', en: 'Cable Pull Through', video: 'https://www.youtube.com/watch?v=eFsNZc69m10', mediaKey: 'cable-pull-through' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: C4,
    workSets: 1, workReps: '8-10',
    tecnica: 'Aprieta fuerte los glúteos arriba en cada repetición. Baja lenta y controlada, luego sube explosivo.',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=lEeCPhlFZig',
    wgerId: null, mediaMp4: null, mediaKey: 'hyperextension-45',
  },
  W3(S1_MARTES[3], 's6-mar-4', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '10-12', rpe: '~7', descanso: '1-2 min' }),
  {
    id: 's6-mar-5', dia: 'Martes', orden: 5,
    nombre: 'Pantorrillas en prensa',
    nombreEn: 'Leg Press Calf Press',
    video: 'https://www.youtube.com/watch?v=S6DTPNZ_-F4',
    alternativas: '',
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: C2,
    workSets: 1, workReps: '8-10',
    tecnica: '',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=S6DTPNZ_-F4',
    wgerId: null, mediaMp4: null, mediaKey: 'leg-press-calf-press',
  },
  {
    id: 's6-mar-6', dia: 'Martes', orden: 6,
    nombre: 'Crunch en máquina',
    nombreEn: 'Machine Crunch',
    video: 'https://www.youtube.com/watch?v=K2yKEoazT3g',
    alternativas: '',
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: C1,
    workSets: 1, workReps: '10-12',
    tecnica: '',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=K2yKEoazT3g',
    wgerId: null, mediaMp4: null, mediaKey: 'machine-crunch',
  },
]

const S6_MIERCOLES: Exercise[] = [
  {
    id: 's6-mie-1', dia: 'Miércoles', orden: 1,
    nombre: 'Jalón al pecho inclinado atrás',
    nombreEn: 'Lean-Back Lat Pulldown',
    video: 'https://www.youtube.com/watch?v=Zjzt4MRbAlc',
    alternativas: 'Jalón inclinado atrás en máquina o Dominadas',
    alts: [
      { es: 'Jalón inclinado atrás en máquina', en: 'Lean-Back Machine Pulldown', video: 'https://www.youtube.com/watch?v=CrfvmSGfT2c', mediaKey: 'lean-back-machine-pulldown' },
      { es: 'Dominadas', en: 'Pull-Up', video: 'https://www.youtube.com/watch?v=5h_NehuTqe4', mediaKey: 'pull-up' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: C3,
    workSets: 1, workReps: '10-12',
    tecnica: 'Inicia el jalón erguido. Al bajar la barra, inclínate ~15-30° para meter más el dorsal medio. Toca suave el pecho en cada rep y, aunque te inclines, controla el peso.',
    tipoPeso: 'cuadrado', pattern: 'pull',
    demoUrl: 'https://www.youtube.com/watch?v=Zjzt4MRbAlc',
    wgerId: null, mediaMp4: null, mediaKey: 'lean-back-lat-pulldown',
  },
  {
    id: 's6-mie-2', dia: 'Miércoles', orden: 2,
    nombre: 'Remo en barra T con apoyo al pecho',
    nombreEn: 'Chest-Supported T-Bar Row',
    video: 'https://www.youtube.com/watch?v=q8qlHwcuOtc',
    alternativas: '',
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: C3,
    workSets: 1, workReps: '10-12',
    tecnica: '',
    tipoPeso: 'cuadrado', pattern: 'remo',
    demoUrl: 'https://www.youtube.com/watch?v=q8qlHwcuOtc',
    wgerId: null, mediaMp4: null, mediaKey: 'chest-supported-tbar-row',
  },
  W3(S1_MIERCOLES[2], 's6-mie-3', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '12-15', rpe: '~7', descanso: '1-2 min' }),
  {
    id: 's6-mie-4', dia: 'Miércoles', orden: 4,
    nombre: 'Encogimiento en polea con pausa',
    nombreEn: 'Cable Paused Shrug-In',
    video: 'https://www.youtube.com/watch?v=Hy6f1Lz_PiA',
    alternativas: '',
    descanso: '1-2 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: C3,
    workSets: 1, workReps: '12-15',
    tecnica: '',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=Hy6f1Lz_PiA',
    wgerId: null, mediaMp4: null, mediaKey: 'cable-paused-shrug-in',
  },
  {
    id: 's6-mie-5', dia: 'Miércoles', orden: 5,
    nombre: 'Curl martillo en polea con cuerda',
    nombreEn: 'Cable Rope Hammer Curl',
    video: 'https://www.youtube.com/watch?v=TTgICSfj1hY',
    alternativas: 'Curl martillo con mancuernas o Curl martillo en predicador',
    alts: [
      { es: 'Curl martillo con mancuernas', en: 'Hammer Curl', video: 'https://www.youtube.com/watch?v=xY3sQXYhk7A', mediaKey: 'hammer-curl' },
      { es: 'Curl martillo en predicador', en: 'Hammer Preacher Curl', video: 'https://www.youtube.com/watch?v=dEdnC3ca-Yg', mediaKey: 'hammer-preacher-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: C1,
    workSets: 1, workReps: '12-15',
    tecnica: 'Aprieta fuerte la cuerda al subir el peso. Reps suaves y controladas.',
    tipoPeso: 'cuadrado', pattern: 'curl',
    demoUrl: 'https://www.youtube.com/watch?v=TTgICSfj1hY',
    wgerId: null, mediaMp4: null, mediaKey: 'cable-rope-hammer-curl',
  },
  {
    id: 's6-mie-6', dia: 'Miércoles', orden: 6,
    nombre: 'Curl concentrado con mancuerna',
    nombreEn: 'DB Concentration Curl',
    video: 'https://www.youtube.com/watch?v=Oq7gJuAuJh0',
    alternativas: 'Curl concentrado en polea o Curl predicador con mancuernas',
    alts: [
      { es: 'Curl concentrado en polea', en: 'Concentration Cable Curl', video: 'https://www.youtube.com/watch?v=BFZyW_7ld0c', mediaKey: 'concentration-cable-curl' },
      { es: 'Curl predicador con mancuernas', en: 'DB Preacher Curl', video: 'https://www.youtube.com/watch?v=WTkQLAethtg', mediaKey: 'db-preacher-curl' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: C1,
    workSets: 1, workReps: '15-20',
    tecnica: 'Reps suaves y controladas. Conexión mente-músculo con el bíceps.',
    tipoPeso: 'redondo', pattern: 'curl',
    demoUrl: 'https://www.youtube.com/watch?v=Oq7gJuAuJh0',
    wgerId: null, mediaMp4: null, mediaKey: 'db-concentration-curl',
  },
]

const S6_JUEVES: Exercise[] = [
  {
    id: 's6-jue-1', dia: 'Jueves', orden: 1,
    nombre: 'Sentadilla hack',
    nombreEn: 'Hack Squat',
    video: 'https://www.youtube.com/watch?v=TWUnnDK8rck',
    alternativas: 'Prensa de piernas o Zancadas caminando con mancuernas',
    alts: [
      { es: 'Prensa de piernas', en: 'Leg Press', video: 'https://www.youtube.com/watch?v=1yKAQLVV_XI', mediaKey: 'leg-press' },
      { es: 'Zancadas caminando con mancuernas', en: 'DB Walking Lunge', video: 'https://www.youtube.com/watch?v=BC_eDtrB-M4', mediaKey: 'db-walking-lunge' },
    ],
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: C4,
    workSets: 1, workReps: '10-12',
    tecnica: 'Negativa controlada (sin dejarte caer) y luego explota subiendo.',
    tipoPeso: 'redondo', pattern: 'pierna',
    demoUrl: 'https://www.youtube.com/watch?v=TWUnnDK8rck',
    wgerId: null, mediaMp4: null, mediaKey: 'hack-squat',
  },
  W3(S1_JUEVES[1], 's6-jue-2', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '12-15', rpe: '~7', descanso: '1-2 min' }),
  W3(S1_JUEVES[2], 's6-jue-3', { calentSets: '2 a 3', calentDetalle: C3, workSets: 1, workReps: '10-12', rpe: '~6', descanso: '2-3 min' }),
  W3(S1_JUEVES[3], 's6-jue-4', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '12-15', rpe: '~7', descanso: '1-2 min' }),
  W3(S1_JUEVES[4], 's6-jue-5', { calentSets: '1 a 2', calentDetalle: C2, workSets: 1, workReps: '12-15', rpe: '~7', descanso: '1-2 min' }),
]

const S6_VIERNES: Exercise[] = [
  {
    id: 's6-vie-1', dia: 'Viernes', orden: 1,
    nombre: 'Press de pecho en máquina',
    nombreEn: 'Machine Chest Press',
    video: 'https://www.youtube.com/watch?v=zDecGJLyVm8',
    alternativas: '',
    descanso: '3-5 min',
    rpe: '~6',
    calentSets: '2 a 4', calentDetalle: C4,
    workSets: 1, workReps: '10-12',
    tecnica: '',
    tipoPeso: 'cuadrado', pattern: 'press',
    demoUrl: 'https://www.youtube.com/watch?v=zDecGJLyVm8',
    wgerId: null, mediaMp4: null, mediaKey: 'machine-chest-press',
  },
  {
    id: 's6-vie-2', dia: 'Viernes', orden: 2,
    nombre: 'Press de hombros sentado con mancuernas',
    nombreEn: 'Seated DB Shoulder Press',
    video: 'https://www.youtube.com/watch?v=B8PB5RPhTWQ',
    alternativas: '',
    descanso: '2-3 min',
    rpe: '~6',
    calentSets: '2 a 3', calentDetalle: C3,
    workSets: 1, workReps: '10-12',
    tecnica: '',
    tipoPeso: 'redondo', pattern: 'press',
    demoUrl: 'https://www.youtube.com/watch?v=B8PB5RPhTWQ',
    wgerId: null, mediaMp4: null, mediaKey: 'seated-db-shoulder-press',
  },
  {
    id: 's6-vie-3', dia: 'Viernes', orden: 3,
    nombre: 'Aperturas en polea sentado (mitad inferior)',
    nombreEn: 'Bottom-Half Seated Cable Flye',
    video: 'https://www.youtube.com/watch?v=tsJMV9Gxw-o',
    alternativas: '',
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: C2,
    workSets: 1, workReps: '12-15',
    tecnica: '',
    tipoPeso: 'cuadrado', pattern: 'polea',
    demoUrl: 'https://www.youtube.com/watch?v=tsJMV9Gxw-o',
    wgerId: null, mediaMp4: null, mediaKey: 'bottom-half-seated-cable-flye',
  },
  W3(S1_VIERNES[3], 's6-vie-4', { calentSets: '1', calentDetalle: C1, workSets: 1, workReps: '12-15', rpe: '~7', descanso: '1-2 min' }),
  {
    id: 's6-vie-5', dia: 'Viernes', orden: 5,
    nombre: 'Rompecráneos con barra EZ (barra Z, no recta)',
    nombreEn: 'EZ-Bar Skull Crusher',
    video: 'https://www.youtube.com/watch?v=oDKGCsTjAk8',
    alternativas: 'Rompecráneos con mancuernas o Extensión de tríceps katana',
    alts: [
      { es: 'Rompecráneos con mancuernas', en: 'DB Skull Crusher', video: 'https://www.youtube.com/watch?v=fbLTzgTKOR8', mediaKey: 'db-skull-crusher' },
      { es: 'Extensión de tríceps katana', en: 'Katana Triceps Extension', video: 'https://www.youtube.com/watch?v=R7f45Mv7yyg', mediaKey: 'katana-triceps-extension' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: C1,
    workSets: 1, workReps: '12-15',
    tecnica: 'Opcional: pausa de 0.5-1 segundo en el estiramiento de cada repetición. Barra EZ = la de forma de Z/serpiente, no la recta.',
    tipoPeso: 'redondo', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=oDKGCsTjAk8',
    wgerId: null, mediaMp4: null, mediaKey: 'ez-bar-skull-crusher',
  },
  {
    id: 's6-vie-6', dia: 'Viernes', orden: 6,
    nombre: 'Press de tríceps en polea (barra)',
    nombreEn: 'Triceps Pressdown (Bar)',
    video: 'https://www.youtube.com/watch?v=o4eazahiXQw',
    alternativas: 'Press de tríceps en polea (cuerda) o Patada de tríceps con mancuerna',
    alts: [
      { es: 'Press de tríceps en polea (cuerda)', en: 'Triceps Pressdown (Rope)', video: 'https://www.youtube.com/watch?v=bCa036rGtVU', mediaKey: 'triceps-pressdown-rope' },
      { es: 'Patada de tríceps con mancuerna', en: 'DB Triceps Kickback', video: 'https://www.youtube.com/watch?v=YdUUYFgpA7g', mediaKey: 'db-triceps-kickback' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1', calentDetalle: C1,
    workSets: 1, workReps: '15-20',
    tecnica: 'Aprieta el tríceps para mover el peso.',
    tipoPeso: 'cuadrado', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=o4eazahiXQw',
    wgerId: null, mediaMp4: null, mediaKey: 'triceps-pressdown-bar',
  },
  {
    id: 's6-vie-7', dia: 'Viernes', orden: 7,
    nombre: 'Rollout abdominal con rueda',
    nombreEn: 'Ab Wheel Rollout',
    video: 'https://www.youtube.com/watch?v=gGTgyCU9gcg',
    alternativas: 'Rollout con balón suizo o Plancha larga (long lever)',
    alts: [
      { es: 'Rollout con balón suizo', en: 'Swiss Ball Rollout', video: 'https://www.youtube.com/watch?v=FvekMyIs-yk', mediaKey: 'swiss-ball-rollout' },
      { es: 'Plancha larga (long lever)', en: 'Long Lever Plank', video: 'https://www.youtube.com/watch?v=9rFS1gg0vJM', mediaKey: 'long-lever-plank' },
    ],
    descanso: '1-2 min',
    rpe: '~7',
    calentSets: '1 a 2', calentDetalle: C2,
    workSets: 1, workReps: '12-15',
    tecnica: 'No solo dobles la cadera: usa el abdomen para bajar controlado y volver a subir. Si aún no tienes fuerza para extenderte del todo abajo, aumenta el recorrido poco a poco semana a semana.',
    tipoPeso: 'corporal', pattern: 'aislado',
    demoUrl: 'https://www.youtube.com/watch?v=gGTgyCU9gcg',
    wgerId: null, mediaMp4: null, mediaKey: 'ab-wheel-rollout',
  },
]

// Semana 7: mismas fichas de S6, 2-3 working sets, Early RPE con rangos y Last RPE hasta 10.
interface S7Cfg { cs: string; cd: CalentSet[]; ws: number; reps: string; early: string; last: string; rest: string; fail?: boolean }
const S7B = (base: Exercise[], p: string, cfg: S7Cfg[], sem = 7): Exercise[] =>
  base.map((e, i) => ({
    ...e,
    id: `s${sem}-${p}-${i + 1}`,
    calentSets: cfg[i].cs, calentDetalle: cfg[i].cd,
    workSets: cfg[i].ws, workReps: cfg[i].reps,
    earlyRpe: cfg[i].early, rpe: cfg[i].last, descanso: cfg[i].rest,
    lastSetTech: cfg[i].fail ? 'Failure' : undefined,
  }));

const S7_LUNES = S7B(S6_LUNES, 'lun', [
  { cs: '2 a 3', cd: C3, ws: 3, reps: '8-10', early: '~7-8', last: '~7-8', rest: '3-5 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '10-12', early: '~7-8', last: '~8-9', rest: '1-2 min' },
  { cs: '1 a 2', cd: C2, ws: 3, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '8-10', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1', cd: C1, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S7_MARTES = S7B(S6_MARTES, 'mar', [
  { cs: '2', cd: C2, ws: 2, reps: '10-12', early: '~7-8', last: '~8-9', rest: '1-2 min' },
  { cs: '2 a 4', cd: C4, ws: 3, reps: '8-10', early: '~7-8', last: '~7-8', rest: '3-5 min' },
  { cs: '2 a 4', cd: C4, ws: 3, reps: '8-10', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '8-10', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S7_MIERCOLES = S7B(S6_MIERCOLES, 'mie', [
  { cs: '2 a 3', cd: C3, ws: 2, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '2 a 3', cd: C3, ws: 3, reps: '10-12', early: '~8-9', last: '10', rest: '2-3 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '2 a 3', cd: C3, ws: 2, reps: '12-15', early: '~7', last: '~8-9', rest: '1-2 min' },
  { cs: '1', cd: C1, ws: 3, reps: '12-15', early: '~7', last: '~8-9', rest: '1-2 min' },
  { cs: '1', cd: C1, ws: 2, reps: '15-20', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S7_JUEVES = S7B(S6_JUEVES, 'jue', [
  { cs: '2 a 4', cd: C4, ws: 3, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '2 a 3', cd: C3, ws: 2, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 3, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S7_VIERNES = S7B(S6_VIERNES, 'vie', [
  { cs: '2 a 4', cd: C4, ws: 3, reps: '10-12', early: '~7-8', last: '~7-8', rest: '3-5 min' },
  { cs: '2 a 3', cd: C3, ws: 2, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 3, reps: '12-15', early: '~7-8', last: '~8-9', rest: '1-2 min' },
  { cs: '1', cd: C1, ws: 2, reps: '15-20', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

// Semana 8: misma base S7, nueva intensidad y fallos (sin Early en S6-base: se hereda igual).
const S8 = (base: Exercise[], p: string, cfg: S7Cfg[]): Exercise[] => S7B(base, p, cfg, 8);

const S8_LUNES = S8(S7_LUNES, 'lun', [
  { cs: '2 a 3', cd: C3, ws: 3, reps: '8-10', early: '~7-8', last: '~7-8', rest: '3-5 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '10-12', early: '~7-8', last: '~8-9', rest: '1-2 min' },
  { cs: '1 a 2', cd: C2, ws: 3, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '8-10', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1', cd: C1, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S8_MARTES = S8(S7_MARTES, 'mar', [
  { cs: '2', cd: C2, ws: 2, reps: '10-12', early: '~7-8', last: '~8-9', rest: '1-2 min' },
  { cs: '2 a 4', cd: C4, ws: 3, reps: '8-10', early: '~7-8', last: '~7-8', rest: '3-5 min' },
  { cs: '2 a 4', cd: C4, ws: 3, reps: '8-10', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '8-10', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 2, reps: '10-12', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S8_MIERCOLES = S8(S7_MIERCOLES, 'mie', [
  { cs: '2 a 3', cd: C3, ws: 2, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '2 a 3', cd: C3, ws: 3, reps: '10-12', early: '~8-9', last: '10', rest: '2-3 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '2 a 3', cd: C3, ws: 2, reps: '12-15', early: '~7', last: '~8-9', rest: '1-2 min' },
  { cs: '1', cd: C1, ws: 3, reps: '12-15', early: '~7', last: '~8-9', rest: '1-2 min' },
  { cs: '1', cd: C1, ws: 2, reps: '15-20', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S8_JUEVES = S8(S7_JUEVES, 'jue', [
  { cs: '2 a 4', cd: C4, ws: 3, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '2 a 3', cd: C3, ws: 2, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 3, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

const S8_VIERNES = S8(S7_VIERNES, 'vie', [
  { cs: '2 a 4', cd: C4, ws: 3, reps: '10-12', early: '~7-8', last: '~7-8', rest: '3-5 min' },
  { cs: '2 a 3', cd: C3, ws: 2, reps: '10-12', early: '~7-8', last: '~7-8', rest: '2-3 min' },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1', cd: C1, ws: 3, reps: '12-15', early: '~7-8', last: '~8-9', rest: '1-2 min' },
  { cs: '1', cd: C1, ws: 2, reps: '15-20', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
  { cs: '1 a 2', cd: C2, ws: 2, reps: '12-15', early: '~8-9', last: '10', rest: '1-2 min', fail: true },
])

// Semana 9: copia exacta de la Semana 8.
const S9_LUNES = COPY(S8_LUNES, 9, 'lun')
const S9_MARTES = COPY(S8_MARTES, 9, 'mar')
const S9_MIERCOLES = COPY(S8_MIERCOLES, 9, 'mie')
const S9_JUEVES = COPY(S8_JUEVES, 9, 'jue')
const S9_VIERNES = COPY(S8_VIERNES, 9, 'vie')
