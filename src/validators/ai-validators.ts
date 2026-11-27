// =====================================================================
// VALIDACIONES
// ---------------------------------------------------------------------
// - Entradas: se revisan ANTES de enviarlas al servicio de IA.
// - Respuestas: se revisan ANTES de mostrarlas. Lo que llega de un
//   servicio externo es `unknown`: no confiamos en él hasta revisarlo.
// =====================================================================

import { fighters } from '../data/fighters'
import type {
    CriterionCheck,
    ScoutingAnalysis,
    SemanticMatch,
    SemanticSearchResult,
} from '../types/ai'
import type { Fighter } from '../types/fighter'

export const MIN_QUERY_LENGTH = 10
export const MAX_QUERY_LENGTH = 300

// ---------- Ayudantes pequeños ----------

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyText(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
}

function isListOfTexts(value: unknown): value is string[] {
    return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyText)
}

function isCountOrNull(value: unknown): boolean {
    if (value === null) {
        return true
    }
    return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

// =====================================================================
// VALIDAR ENTRADAS
// Devuelven un mensaje de error, o null si todo está bien.
// =====================================================================

export function validateFighterInput(fighter: Fighter): string | null {
    if (!Number.isInteger(fighter.id) || fighter.id <= 0) {
        return 'El luchador no tiene un id válido.'
    }

    const { wins, losses, draws, methods } = fighter.record
    const counts = [
        wins,
        losses,
        draws,
        methods.ko,
        methods.tko,
        methods.submission,
        methods.decision,
        methods.firstRoundKos,
    ]

    if (!counts.every(isCountOrNull)) {
        return 'El récord del luchador tiene datos inválidos.'
    }

    return null
}

export function validateQueryInput(query: string): string | null {
    const text = query.trim()

    if (text.length === 0) {
        return 'Escribe qué tipo de luchador buscas.'
    }
    if (text.length < MIN_QUERY_LENGTH) {
        return `Describe un poco más lo que buscas (mínimo ${MIN_QUERY_LENGTH} caracteres).`
    }
    if (text.length > MAX_QUERY_LENGTH) {
        return `La descripción es muy larga (máximo ${MAX_QUERY_LENGTH} caracteres).`
    }
    if (!/[a-záéíóúñ]/i.test(text)) {
        return 'La descripción debe tener palabras, no solo números o símbolos.'
    }

    return null
}

// =====================================================================
// VALIDAR RESPUESTAS
// Devuelven los datos ya tipados, o null si la respuesta no sirve.
// =====================================================================

export function parseScoutingAnalysis(value: unknown): ScoutingAnalysis | null {
    if (!isObject(value)) {
        return null
    }

    const { summary, strengths, weaknesses, recommendation, projection } = value

    if (!isNonEmptyText(summary)) return null
    if (!isListOfTexts(strengths)) return null
    if (!isListOfTexts(weaknesses)) return null
    if (!isNonEmptyText(recommendation)) return null
    if (projection !== 'Alta' && projection !== 'Media' && projection !== 'Baja') {
        return null
    }

    return { summary, strengths, weaknesses, recommendation, projection }
}

function parseCheck(value: unknown): CriterionCheck | null {
    if (!isObject(value)) return null
    if (!isNonEmptyText(value.label)) return null
    if (typeof value.met !== 'boolean') return null

    return { label: value.label, met: value.met }
}

function parseMatch(value: unknown): SemanticMatch | null {
    if (!isObject(value)) return null

    const { fighterId, score, checks } = value

    // El id tiene que ser de un luchador que exista de verdad
    const fighterExists = fighters.some((fighter) => fighter.id === fighterId)
    if (typeof fighterId !== 'number' || !fighterExists) return null

    if (typeof score !== 'number' || score < 0 || score > 100) return null
    if (!Array.isArray(checks)) return null

    const parsedChecks: CriterionCheck[] = []
    for (const check of checks) {
        const parsed = parseCheck(check)
        if (parsed === null) return null
        parsedChecks.push(parsed)
    }

    return { fighterId, score, checks: parsedChecks }
}

export function parseSemanticSearch(
    value: unknown,
): SemanticSearchResult | null {
    if (!isObject(value)) return null

    const { criteria, matches } = value

    if (!Array.isArray(criteria) || !Array.isArray(matches)) return null

    const parsedCriteria = []
    for (const criterion of criteria) {
        if (!isObject(criterion) || !isNonEmptyText(criterion.label)) return null
        parsedCriteria.push({ label: criterion.label })
    }

    const parsedMatches: SemanticMatch[] = []
    for (const match of matches) {
        const parsed = parseMatch(match)
        if (parsed === null) return null
        parsedMatches.push(parsed)
    }

    return { criteria: parsedCriteria, matches: parsedMatches }
}