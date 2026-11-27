// =====================================================================
// SIMULADOR (MOCK) DEL PROVEEDOR DE IA
// ---------------------------------------------------------------------
// Este archivo hace el papel de un servicio de IA externo.
// No llama a ningún modelo real: genera la respuesta con reglas a partir
// de los datos del luchador o del texto escrito.
//
// Se comporta como una API de verdad:
//   - tarda un poco en responder (latencia simulada)
//   - devuelve `unknown` (como un JSON que llega por la red)
//   - puede fallar o devolver basura, para probar los errores controlados
//
// Para forzar un error, agrega a la URL de la página:
//   ?simular=fallo     -> el servicio "se cae" (como un error 503)
//   ?simular=invalido  -> el servicio responde algo con formato incorrecto
// =====================================================================

import { fighters } from '../data/fighters'
import type { Fighter } from '../types/fighter'
import { normalizeText } from '../utils/normalize-text'

const DELAY_MS = 1200

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Lee ?simular=... de la URL. Devuelve 'fallo', 'invalido' o null.
function getSimulatedProblem(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('simular')
}

// Pasa por la "red" simulada: espera, y si se pidió, falla o responde mal.
async function simulateNetwork(goodResponse: unknown): Promise<unknown> {
  await wait(DELAY_MS)

  const problem = getSimulatedProblem()

  if (problem === 'fallo') {
    throw new Error('503 Service Unavailable')
  }

  if (problem === 'invalido') {
    return { resultado: 'texto sin formato', codigo: 42 }
  }

  return goodResponse
}

// ---------- Ayudantes de cálculo ----------

function toPercent(part: number, total: number): number {
  if (total === 0) {
    return 0
  }
  return Math.round((part / total) * 100)
}

// Porcentaje de victorias que fueron por KO o TKO
function getKoRate(fighter: Fighter): number {
  const { ko, tko } = fighter.record.methods
  return toPercent(ko + tko, fighter.record.wins)
}

// lastFightDate viene como "DD-MM-YYYY"
function getMonthsSinceLastFight(fighter: Fighter): number {
  const [day, month, year] = fighter.lastFightDate.split('-').map(Number)
  const lastFight = new Date(year, month - 1, day)
  const today = new Date()

  const months =
    (today.getFullYear() - lastFight.getFullYear()) * 12 +
    (today.getMonth() - lastFight.getMonth())

  return Math.max(0, months)
}

// =====================================================================
// 1) ANÁLISIS DE SCOUTING
// =====================================================================

export async function mockScoutingAnalysis(fighter: Fighter): Promise<unknown> {
  const { record, stance } = fighter
  const { methods } = record

  const totalFights = record.wins + record.losses + record.draws
  const winRate = toPercent(record.wins, totalFights)
  const koRate = getKoRate(fighter)
  const decisionRate = toPercent(methods.decision, record.wins)
  const submissions = methods.submission ?? 0
  const reachAdvantage = fighter.reachCm - fighter.heightCm
  const monthsInactive = getMonthsSinceLastFight(fighter)

  // ----- Fortalezas -----
  const strengths: string[] = []

  if (winRate >= 80) {
    strengths.push(`Récord muy sólido: gana el ${winRate}% de sus peleas.`)
  }
  if (koRate >= 50) {
    strengths.push(
      `Gran poder de nocaut: el ${koRate}% de sus victorias son por KO o TKO.`,
    )
  }
  if (methods.firstRoundKos >= 2) {
    strengths.push(
      `Peligroso desde el inicio: ${methods.firstRoundKos} KOs en el primer round.`,
    )
  }
  if (submissions >= 2) {
    strengths.push(
      `Finaliza en el suelo: ${submissions} victorias por sumisión.`,
    )
  }
  if (reachAdvantage >= 5) {
    strengths.push(
      `Alcance largo (+${reachAdvantage} cm sobre su estatura): controla la distancia.`,
    )
  }
  if (stance === 'Zurda') {
    strengths.push('Guardia zurda: incómoda para rivales ortodoxos.')
  }
  if (stance === 'Switch') {
    strengths.push('Cambia de guardia durante la pelea: difícil de leer.')
  }
  if (fighter.achievements.length > 0) {
    strengths.push(
      `Tiene ${fighter.achievements.length} logro(s) en su palmarés.`,
    )
  }

  // ----- Debilidades -----
  const weaknesses: string[] = []

  if (record.losses >= 3) {
    weaknesses.push(
      `Acumula ${record.losses} derrotas: revisar contra qué estilos perdió.`,
    )
  }
  if (decisionRate >= 60) {
    weaknesses.push(
      `El ${decisionRate}% de sus victorias son por decisión: le cuesta terminar peleas.`,
    )
  }
  if (totalFights < 8) {
    weaknesses.push(`Poca experiencia: solo ${totalFights} peleas registradas.`)
  }
  if (monthsInactive >= 6) {
    weaknesses.push(
      `Lleva ${monthsInactive} meses sin pelear: puede llegar con óxido.`,
    )
  }
  if (fighter.competitiveStatus !== 'Activo') {
    weaknesses.push(`Su estado competitivo es "${fighter.competitiveStatus}".`)
  }
  if (!fighter.availableToFight) {
    weaknesses.push('No está disponible para pelear por ahora.')
  }
  if (fighter.age >= 33) {
    weaknesses.push(`Con ${fighter.age} años, está en la etapa final de su carrera.`)
  }

  if (strengths.length === 0) {
    strengths.push('Sin fortalezas destacadas en sus estadísticas.')
  }
  if (weaknesses.length === 0) {
    weaknesses.push(
      'No se ven debilidades claras en los números; falta revisar video de sus peleas.',
    )
  }

  // ----- Proyección: más fortalezas que debilidades = mejor proyección -----
  let points = strengths.length - weaknesses.length
  if (fighter.age <= 27) {
    points = points + 1
  }

  let projection = 'Baja'
  if (points >= 3) {
    projection = 'Alta'
  } else if (points >= 1) {
    projection = 'Media'
  }

  // ----- Recomendación -----
  let recommendation: string
  if (projection === 'Alta' && fighter.availableToFight) {
    recommendation =
      'Recomendado para contratar ya: está disponible y sus números lo respaldan.'
  } else if (projection === 'Alta') {
    recommendation =
      'Buen prospecto, pero hoy no está disponible. Seguirlo de cerca.'
  } else if (projection === 'Media') {
    recommendation =
      'Ver video de sus peleas antes de ofrecer contrato; ideal contra rivales de su mismo nivel.'
  } else {
    recommendation =
      'No priorizar por ahora; volver a revisar después de sus próximas peleas.'
  }

  const summary = `${fighter.name} "${fighter.nickname}": ${fighter.discipline}, récord ${record.wins}-${record.losses}-${record.draws}, estilo ${fighter.fightStyle.toLowerCase()} de guardia ${stance.toLowerCase()}, de ${fighter.city}.`

  const response = {
    summary: summary,
    strengths: strengths,
    weaknesses: weaknesses,
    recommendation: recommendation,
    projection: projection,
  }

  return simulateNetwork(response)
}

// =====================================================================
// 2) BÚSQUEDA SEMÁNTICA POR LENGUAJE NATURAL
// ---------------------------------------------------------------------
// Paso 1: "entender" el texto -> sacar una lista de criterios.
// Paso 2: revisar a cada luchador contra esos criterios.
// Paso 3: puntaje = criterios cumplidos / criterios totales.
// =====================================================================

type Criterion = {
  label: string
  isMet: (fighter: Fighter) => boolean
}

// Cada regla: si el texto coincide con `pattern`, se agrega ese criterio.
const RULES: { pattern: RegExp; criterion: Criterion }[] = [
  {
    pattern: /\bzurd[oa]s?\b/,
    criterion: { label: 'Guardia zurda', isMet: (f) => f.stance === 'Zurda' },
  },
  {
    pattern: /\bortodox[oa]s?\b|\bdiestr[oa]s?\b/,
    criterion: {
      label: 'Guardia ortodoxa',
      isMet: (f) => f.stance === 'Ortodoxa',
    },
  },
  {
    pattern: /\bswitch\b|cambia de guardia/,
    criterion: {
      label: 'Cambia de guardia',
      isMet: (f) => f.stance === 'Switch',
    },
  },
  {
    pattern: /\bboxe(o|ador|adora|adores)\b/,
    criterion: { label: 'Boxeo', isMet: (f) => f.discipline === 'Boxeo' },
  },
  {
    pattern: /\bmma\b|artes marciales mixtas/,
    criterion: { label: 'MMA', isMet: (f) => f.discipline === 'MMA' },
  },
  {
    pattern: /\bkos?\b|nocaut|knockout|pegada|poder|noqueador/,
    criterion: {
      label: 'Poder de KO (50% o más de victorias por KO/TKO)',
      isMet: (f) => getKoRate(f) >= 50,
    },
  },
  {
    pattern: /sumision|grappl|suelo|jiu|bjj/,
    criterion: {
      label: 'Bueno en el suelo (2 o más sumisiones)',
      isMet: (f) => (f.record.methods.submission ?? 0) >= 2,
    },
  },
  {
    pattern: /\bactiv[oa]s?\b/,
    criterion: {
      label: 'Estado activo',
      isMet: (f) => f.competitiveStatus === 'Activo',
    },
  },
  {
    pattern: /disponible|manana|\bhoy\b|pronto|corto aviso|reemplazo/,
    criterion: {
      label: 'Disponible para pelear ya',
      isMet: (f) => f.availableToFight,
    },
  },
  {
    pattern: /invict/,
    criterion: { label: 'Invicto', isMet: (f) => f.record.losses === 0 },
  },
  {
    pattern: /experiencia|experimentad|veteran/,
    criterion: {
      label: 'Experiencia (12 o más peleas)',
      isMet: (f) => f.record.wins + f.record.losses + f.record.draws >= 12,
    },
  },
  {
    pattern: /joven|prospecto/,
    criterion: { label: 'Joven (25 años o menos)', isMet: (f) => f.age <= 25 },
  },
  {
    pattern: /\bmujer(es)?\b|femenin|\bpeleadoras?\b|\bboxeadoras?\b|\bluchadoras?\b/,
    criterion: { label: 'Mujer', isMet: (f) => f.sex === 'Femenino' },
  },
  {
    pattern: /\bhombres?\b|masculin/,
    criterion: { label: 'Hombre', isMet: (f) => f.sex === 'Masculino' },
  },
  {
    pattern: /profesional/,
    criterion: {
      label: 'Nivel profesional',
      isMet: (f) => f.competitiveLevel === 'Profesional',
    },
  },
  {
    pattern: /amateur/,
    criterion: {
      label: 'Nivel amateur',
      isMet: (f) => f.competitiveLevel === 'Amateur',
    },
  },
]

function findCriteria(query: string): Criterion[] {
  const text = normalizeText(query)
  const found: Criterion[] = []

  // Reglas fijas (guardia, disciplina, KO, estado, etc.)
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      found.push(rule.criterion)
    }
  }

  // Ciudades: se buscan las ciudades que existen en los datos
  const cities = new Set(fighters.map((fighter) => fighter.city))
  for (const city of cities) {
    if (text.includes(normalizeText(city))) {
      found.push({
        label: `Vive en ${city}`,
        isMet: (f) => f.city === city,
      })
    }
  }

  return found
}

export async function mockSemanticSearch(query: string): Promise<unknown> {
  const criteria = findCriteria(query)

  const matches = fighters.map((fighter) => {
    const checks = criteria.map((criterion) => ({
      label: criterion.label,
      met: criterion.isMet(fighter),
    }))

    const metCount = checks.filter((check) => check.met).length

    return {
      fighterId: fighter.id,
      score: toPercent(metCount, criteria.length),
      checks: checks,
    }
  })

  // Solo los que cumplen algo, del mejor al peor
  const ranked = matches
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)

  const response = {
    criteria: criteria.map((criterion) => ({ label: criterion.label })),
    matches: ranked,
  }

  return simulateNetwork(response)
}