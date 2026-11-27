// =====================================================================
// SERVICIO DE IA (lo único que usan los componentes)
// ---------------------------------------------------------------------
// Cada función sigue los mismos 4 pasos:
//   1. Validar la entrada        -> si está mal, no se llama a la IA
//   2. Llamar a la IA            -> si falla, se atrapa el error
//   3. Validar la respuesta      -> si viene con mal formato, se rechaza
//   4. Devolver { ok: true, data } o { ok: false, error }
//
// ¿A quién llama?
//   - Si existe VITE_AI_API_URL  -> al Worker, que llama a Gemini (IA real)
//   - Si no existe               -> al simulador (mock), por ejemplo en el CI
//   - Si la URL tiene ?simular=  -> al simulador, para forzar errores en la demo
// =====================================================================

import { fighters } from '../data/fighters'
import type {
  AiResponse,
  ScoutingAnalysis,
  SemanticSearchResult,
} from '../types/ai'
import type { Fighter } from '../types/fighter'
import {
  parseScoutingAnalysis,
  parseSemanticSearch,
  validateFighterInput,
  validateQueryInput,
} from '../validators/ai-validators'
import { postToAiApi } from './ai-api-client'
import { mockScoutingAnalysis, mockSemanticSearch } from './ai-mock-server'

const SERVICE_DOWN_MESSAGE =
  'El servicio de IA no está disponible en este momento. Inténtalo de nuevo en unos segundos.'

const INVALID_RESPONSE_MESSAGE =
  'La IA devolvió una respuesta con un formato inesperado, así que no la mostramos.'

function shouldUseMock(): boolean {
  const apiUrl = import.meta.env.VITE_AI_API_URL
  const forcedProblem = new URLSearchParams(window.location.search).get('simular')

  return !apiUrl || forcedProblem !== null
}

// Nombre que se muestra en la interfaz para ser honestos con el usuario
export function getAiProviderName(): string {
  return shouldUseMock() ? 'simulador' : 'Gemini'
}

export async function generateScoutingAnalysis(
  fighter: Fighter,
): Promise<AiResponse<ScoutingAnalysis>> {
  // 1. Validar entrada
  const inputError = validateFighterInput(fighter)
  if (inputError !== null) {
    return { ok: false, error: inputError }
  }

  // 2. Llamar a la IA
  let rawResponse: unknown
  try {
    if (shouldUseMock()) {
      rawResponse = await mockScoutingAnalysis(fighter)
    } else {
      rawResponse = await postToAiApi('/api/scouting-analysis', { fighter })
    }
  } catch {
    return { ok: false, error: SERVICE_DOWN_MESSAGE }
  }

  // 3. Validar respuesta
  const analysis = parseScoutingAnalysis(rawResponse)
  if (analysis === null) {
    return { ok: false, error: INVALID_RESPONSE_MESSAGE }
  }

  // 4. Todo bien
  return { ok: true, data: analysis }
}

export async function searchFightersWithAi(
  query: string,
): Promise<AiResponse<SemanticSearchResult>> {
  // 1. Validar entrada
  const inputError = validateQueryInput(query)
  if (inputError !== null) {
    return { ok: false, error: inputError }
  }

  const cleanQuery = query.trim()

  // 2. Llamar a la IA (se envían los luchadores para que el modelo los evalúe)
  let rawResponse: unknown
  try {
    if (shouldUseMock()) {
      rawResponse = await mockSemanticSearch(cleanQuery)
    } else {
      rawResponse = await postToAiApi('/api/semantic-search', {
        query: cleanQuery,
        fighters: fighters,
      })
    }
  } catch {
    return { ok: false, error: SERVICE_DOWN_MESSAGE }
  }

  // 3. Validar respuesta
  const result = parseSemanticSearch(rawResponse)
  if (result === null) {
    return { ok: false, error: INVALID_RESPONSE_MESSAGE }
  }

  // 4. Todo bien
  return { ok: true, data: result }
}