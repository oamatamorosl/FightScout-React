// Pruebas de las validaciones de IA (igual que tests/review.test.js del profe).
// Se ejecutan con: pnpm test
import { describe, expect, test } from 'vitest'

import { fighters } from '../data/fighters'
import { normalizeText } from '../utils/normalize-text'
import {
  parseScoutingAnalysis,
  parseSemanticSearch,
  validateFighterInput,
  validateQueryInput,
} from './ai-validators'

describe('validar entradas', () => {
  test('rechaza una búsqueda vacía', () => {
    expect(validateQueryInput('   ')).not.toBeNull()
  })

  test('rechaza una búsqueda muy corta', () => {
    expect(validateQueryInput('hola')).not.toBeNull()
  })

  test('rechaza una búsqueda sin letras', () => {
    expect(validateQueryInput('1234567890 !!')).not.toBeNull()
  })

  test('acepta una búsqueda normal', () => {
    expect(validateQueryInput('boxeador zurdo de Guayaquil')).toBeNull()
  })

  test('acepta un luchador válido de los datos', () => {
    expect(validateFighterInput(fighters[0])).toBeNull()
  })
})

describe('validar respuesta del análisis', () => {
  const goodAnalysis = {
    summary: 'Boxeador zurdo de Guayaquil.',
    strengths: ['Pega duro'],
    weaknesses: ['Poca defensa'],
    recommendation: 'Contratar ya.',
    projection: 'Alta',
  }

  test('acepta una respuesta con el formato correcto', () => {
    expect(parseScoutingAnalysis(goodAnalysis)).toEqual(goodAnalysis)
  })

  test('rechaza una respuesta que no es un objeto', () => {
    expect(parseScoutingAnalysis('texto suelto')).toBeNull()
  })

  test('rechaza una proyección que no existe', () => {
    expect(parseScoutingAnalysis({ ...goodAnalysis, projection: 'Altísima' })).toBeNull()
  })

  test('rechaza listas vacías de fortalezas', () => {
    expect(parseScoutingAnalysis({ ...goodAnalysis, strengths: [] })).toBeNull()
  })
})

describe('validar respuesta de la búsqueda', () => {
  test('acepta una respuesta con el formato correcto', () => {
    const response = {
      criteria: [{ label: 'Guardia zurda' }],
      matches: [{ fighterId: 4, score: 100, checks: [{ label: 'Guardia zurda', met: true }] }],
    }
    expect(parseSemanticSearch(response)).not.toBeNull()
  })

  test('rechaza un luchador que no existe (id inventado por la IA)', () => {
    const response = {
      criteria: [{ label: 'Guardia zurda' }],
      matches: [{ fighterId: 999, score: 100, checks: [] }],
    }
    expect(parseSemanticSearch(response)).toBeNull()
  })

  test('rechaza un puntaje fuera de 0 a 100', () => {
    const response = {
      criteria: [],
      matches: [{ fighterId: 4, score: 150, checks: [] }],
    }
    expect(parseSemanticSearch(response)).toBeNull()
  })

  test('rechaza una respuesta sin el formato esperado', () => {
    expect(parseSemanticSearch({ resultado: 'texto sin formato', codigo: 42 })).toBeNull()
  })
})

describe('normalizar texto', () => {
  test('quita tildes y pasa a minúsculas', () => {
    expect(normalizeText('MAÑANA en Guayaquil')).toBe('manana en guayaquil')
  })
})