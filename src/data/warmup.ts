import type { Profile } from '../lib/storage'

export interface WarmItem {
  id: string
  nombre: string
  en?: string
  reps: string
  nota?: string
}

export interface WarmStep {
  id: string
  titulo: string
  detalle: string
  aviso?: string
  maquinas?: string[]
  items?: WarmItem[]
}

export interface WarmPlan {
  titulo: string
  intro: string
  maquinaInicial: string
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
        { id: 'swings', nombre: 'Balanceo de brazos', en: 'Arm Swings', reps: '10 por lado' },
        { id: 'circles', nombre: 'Círculos con los brazos', en: 'Arm Circles', reps: '10 por lado' },
        { id: 'leg-fb', nombre: 'Balanceo de piernas adelante y atrás', en: 'Front-to-Back Leg Swings', reps: '10 por lado' },
        { id: 'leg-ss', nombre: 'Balanceo de piernas de lado a lado', en: 'Side-to-Side Leg Swings', reps: '10 por lado' },
        { id: 'ext', nombre: 'Rotación externa en polea', en: 'Cable External Rotation', reps: '15 por lado', nota: 'Opcional' },
      ],
    },
  ],
}

const MARIAN: WarmPlan = {
  titulo: 'Calentamiento',
  intro: 'Antes de las pesas. La rodilla manda: movimiento cerrado y los dos pies apoyados.',
  maquinaInicial: 'Bicicleta',
  pasos: [
    {
      id: 'cardio',
      titulo: 'Cardio ligero',
      detalle: '5 a 10 minutos en bicicleta estática. Es un movimiento cerrado y cuida la rótula.',
      aviso: 'Mejor sin escaladora ni caminadora rápida: el impacto y apoyar todo el peso en un solo pie cargan la rodilla.',
      maquinas: ['Bicicleta'],
    },
    {
      id: 'torso',
      titulo: 'Movilidad del torso',
      detalle: 'Igual que siempre, sin involucrar la rodilla.',
      items: [
        { id: 'swings', nombre: 'Balanceo de brazos', en: 'Arm Swings', reps: '10 por lado' },
        { id: 'circles', nombre: 'Círculos con los brazos', en: 'Arm Circles', reps: '10 por lado' },
        { id: 'ext', nombre: 'Rotación externa en polea', en: 'Cable External Rotation', reps: '15 por lado' },
      ],
    },
    {
      id: 'piso',
      titulo: 'Cadera en el piso',
      detalle: 'En vez de balancear la pierna de pie. Los dos apoyos firmes, sin que la rodilla se vaya hacia adentro.',
      items: [
        { id: 'bridge', nombre: 'Puente de glúteo', en: 'Glute Bridge', reps: '10 a 15', nota: 'Boca arriba, rodillas dobladas, sube la cadera.' },
        { id: 'clam', nombre: 'Almeja', en: 'Clamshell', reps: '10 a 15 por lado', nota: 'De lado, pies juntos, abre la rodilla de arriba. Despierta el glúteo medio.' },
      ],
    },
  ],
}

export function warmupFor(profile: Profile): WarmPlan {
  return profile === 'novia' ? MARIAN : JUAN
}
