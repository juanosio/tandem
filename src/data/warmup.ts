import type { Profile } from '../lib/storage'

export interface WarmItem {
  id: string
  nombre: string
  en?: string
  reps: string
  nota?: string
  gif?: string
}

export interface WarmStep {
  id: string
  titulo: string
  detalle: string
  aviso?: string
  maquinas?: string[]
  items?: WarmItem[]
}

export const WARMUP_VIDEO = 'https://www.youtube.com/watch?v=tFpwBr_7KPg'

export interface WarmPlan {
  titulo: string
  intro: string
  maquinaInicial: string
  videoNota?: string
  pasos: WarmStep[]
}

const JUAN: WarmPlan = {
  titulo: 'Calentamiento',
  intro: 'Antes de las pesas. No es una serie: es para llegar tibio y suelto.',
  maquinaInicial: 'Caminadora',
  pasos: [
    {
      id: 'cardio',
      titulo: 'Cardio ligero',
      detalle: '5 a 10 minutos a ritmo suave, solo para subir la temperatura. Elige la máquina que tengas a mano.',
      maquinas: ['Caminadora', 'Escaladora', 'Elíptica', 'Bicicleta'],
    },
    {
      id: 'movilidad',
      titulo: 'Movilidad dinámica',
      detalle: '10 repeticiones por lado, sin apurar y sin cargar peso.',
      items: [
        { id: 'swings', nombre: 'Balanceo de brazos', en: 'Arm Swings', reps: '10 por lado', gif: '/warmup/arm-swings.gif' },
        { id: 'circles', nombre: 'Círculos con los brazos', en: 'Arm Circles', reps: '10 por lado', gif: '/warmup/arm-circles.gif' },
        { id: 'leg-fb', nombre: 'Balanceo de piernas adelante y atrás', en: 'Front-to-Back Leg Swings', reps: '10 por lado', gif: '/warmup/leg-swing-front.gif' },
        { id: 'leg-ss', nombre: 'Balanceo de piernas de lado a lado', en: 'Side-to-Side Leg Swings', reps: '10 por lado', gif: '/warmup/leg-swing-side.gif' },
        { id: 'ext', nombre: 'Rotación externa en polea', en: 'Cable External Rotation', reps: '15 por lado', nota: 'Opcional' },
      ],
    },
  ],
}

const MARIAN: WarmPlan = {
  titulo: 'Calentamiento',
  intro: 'Antes de las pesas. La rodilla manda: movimiento cerrado y los dos pies apoyados.',
  maquinaInicial: 'Bicicleta',
  videoNota: 'Calentamiento de piernas especial, por la rodilla. En el video, sáltate los balanceos de pie. Los tuyos son el puente y la almeja, en el piso.',
  pasos: [
    {
      id: 'cardio',
      titulo: 'Cardio ligero',
      detalle: '5 a 10 minutos en bicicleta estática.',
      maquinas: ['Bicicleta'],
    },
    {
      id: 'torso',
      titulo: 'Movilidad del torso',
      detalle: '10 repeticiones por lado, sin peso.',
      items: [
        { id: 'swings', nombre: 'Balanceo de brazos', en: 'Arm Swings', reps: '10 por lado', gif: '/warmup/arm-swings.gif' },
        { id: 'circles', nombre: 'Círculos con los brazos', en: 'Arm Circles', reps: '10 por lado', gif: '/warmup/arm-circles.gif' },
        { id: 'ext', nombre: 'Rotación externa en polea', en: 'Cable External Rotation', reps: '15 por lado' },
      ],
    },
    {
      id: 'piso',
      titulo: 'Cadera en el piso',
      detalle: 'Calentamiento de piernas especial. Por la rodilla no haces los balanceos de pie del video.',
      aviso: 'Los dos apoyos firmes, sin que la rodilla se vaya hacia adentro.',
      items: [
        { id: 'bridge', nombre: 'Puente de glúteo', en: 'Glute Bridge', reps: '10 a 15', nota: 'Boca arriba, rodillas dobladas, sube la cadera.', gif: '/warmup/glute-bridge.gif' },
        { id: 'clam', nombre: 'Almeja', en: 'Clamshell', reps: '10 a 15 por lado', nota: 'De lado, pies juntos, abre la rodilla de arriba. Despierta el glúteo medio.', gif: '/warmup/clamshell.gif' },
      ],
    },
  ],
}

export function warmupFor(profile: Profile): WarmPlan {
  return profile === 'novia' ? MARIAN : JUAN
}
