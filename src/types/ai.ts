// Tipos de lo que DEVUELVE el servicio de IA.
// La app solo usa estos datos DESPUÉS de validarlos (ver src/validators/ai-validators.ts).

// ---------- 1) Análisis de scouting de un luchador ----------

export type ProjectionLevel = 'Alta' | 'Media' | 'Baja'

export type ScoutingAnalysis = {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  projection: ProjectionLevel
}

// ---------- 2) Búsqueda semántica (lenguaje natural) ----------

// Un criterio que la IA entendió del texto, por ejemplo "Guardia zurda"
export type SearchCriterion = {
  label: string
}

// Qué criterios cumple (o no) un luchador
export type CriterionCheck = {
  label: string
  met: boolean
}

export type SemanticMatch = {
  fighterId: number
  score: number // de 0 a 100
  checks: CriterionCheck[]
}

export type SemanticSearchResult = {
  criteria: SearchCriterion[]
  matches: SemanticMatch[]
}

// Resultado de llamar al servicio: o salió bien, o hay un mensaje de error
// controlado para mostrar al usuario. Así la pantalla nunca se rompe.
export type AiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

// ---------- Estado de la búsqueda con IA (vive en App para no perderse
// al entrar a un perfil y volver con "Volver a resultados") ----------

export type SearchMode = 'texto' | 'ia'

export type AiSearchStatus = 'inicial' | 'cargando' | 'exito' | 'error'

export type AiSearchState = {
  query: string
  status: AiSearchStatus
  result: SemanticSearchResult | null
  error: string
}

export const initialAiSearchState: AiSearchState = {
  query: '',
  status: 'inicial',
  result: null,
  error: '',
}