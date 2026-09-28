import type { Exercise } from '../types'
import { getBody, type Profile } from './storage'

function roundKg(n: number): number {
  return Math.max(1, Math.round(n))
}

function kindOf(ex: Exercise): 'bar' | 'press' | 'machine' | 'db-lateral' | 'db' | 'body' {
  const n = ex.nombre.toLowerCase()
  if (ex.tipoPeso === 'corporal' || /dominada|peso corporal|flexión|flexion|plancha|rueda abdominal/.test(n)) return 'body'
  if (/prensa/.test(n)) return 'press'
  if (/elevaci[oó]n lateral/.test(n) && /mancuerna/.test(n)) return 'db-lateral'
  if (/mancuerna/.test(n)) return 'db'
  if (/barra|smith|peso muerto|sentadilla/.test(n)) return 'bar'
  if (/elevaci[oó]n lateral|curl |tr[ií]ceps|apertura/.test(n) && ex.tipoPeso === 'redondo') return 'db'
  return 'machine'
}

const CIERRE = 'Que salgan fluidas y controladas.'

export function firstLoadGuide(profile: Profile, ex: Exercise): { title: string; body: string } {
  const { kg } = getBody(profile)
  const lo = roundKg(kg * 0.2)
  const hi = roundKg(kg * 0.3)
  const kind = kindOf(ex)
  const title = 'Primera vez aquí'

  if (kind === 'body') {
    return {
      title,
      body: `Empieza con tu peso. Si no llegas limpio, usa la asistida. ${CIERRE}`,
    }
  }

  if (profile === 'novia') {
    if (kind === 'bar') {
      return {
        title,
        body: `Empieza con una barra fija de 10 kg. Si está liviana, pasa a 12.5 o 15 kg. Si pesa, baja a una más liviana. ${CIERRE}`,
      }
    }
    if (kind === 'press') {
      return {
        title,
        body: `Empieza sin discos. Si sobra y las rodillas bajan bien, suma el disco más chico. Si pesa o molesta, no sumes. ${CIERRE}`,
      }
    }
    if (kind === 'db-lateral') {
      return {
        title,
        body: `Empieza con 1 o 1.5 kg. Si sobran reps, sube 0.5 o 1 kg. Si pesa, quédate en la más liviana. ${CIERRE}`,
      }
    }
    if (kind === 'db') {
      return {
        title,
        body: `Empieza con 2 o 3 kg. Si sobran reps, sube 0.5 o 1 kg. Si pesa, baja. ${CIERRE}`,
      }
    }
    return {
      title,
      body: `Empieza entre ${lo} y ${hi} kg (placa 1 o 2). Si va cómodo, sube una placa. Si tiembla, baja una. ${CIERRE}`,
    }
  }

  if (kind === 'bar') {
    return {
      title,
      body: 'Empieza con 20 kg, la barra sola. Si está liviana, suma 2.5 o 5 kg por lado. Si pesa, quédate en la barra. ' + CIERRE,
    }
  }
  if (kind === 'press') {
    return {
      title,
      body: `Empieza entre ${lo} y ${hi} kg, o sin discos si el carro ya pesa. Si va cómodo, sube una placa. Si tiembla, baja. ${CIERRE}`,
    }
  }
  if (kind === 'machine') {
    return {
      title,
      body: `Empieza entre ${lo} y ${hi} kg. Si va cómodo, sube una placa. Si tiembla, baja una. ${CIERRE}`,
    }
  }
  if (kind === 'db-lateral') {
    return {
      title,
      body: 'Empieza con 2.5 kg. Si sobran reps, sube al siguiente par. Si pesa, usa una más liviana. ' + CIERRE,
    }
  }
  return {
    title,
    body: 'Empieza con 5 kg. Si sobran reps, sube a 7.5 kg. Si pesa, baja al par anterior. ' + CIERRE,
  }
}
