// =====================================================================
// BACKEND DE IA DE FIGHTSCOUT (Cloudflare Worker)
// ---------------------------------------------------------------------
// ¿Por qué existe? Porque la API key de Gemini NO puede ir en React:
// todo lo que está en el frontend lo puede ver cualquiera en el navegador.
//
// Flujo:  React  --(datos)-->  este Worker  --(datos + API key)-->  Gemini
//         React  <--(JSON)---  este Worker  <--------(JSON)---------  Gemini
//
// Rutas:
//   GET  /api/health              -> para comprobar que el Worker está vivo
//   POST /api/scouting-analysis   -> body: { fighter }
//   POST /api/semantic-search     -> body: { query, fighters }
//
// La key vive en env.GEMINI_API_KEY (un "secret" de Cloudflare).
// =====================================================================

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const MIN_QUERY_LENGTH = 10
const MAX_QUERY_LENGTH = 300

// ---------------------------------------------------------------------
// CORS: solo las páginas de ALLOWED_ORIGINS pueden llamar al Worker
// desde el navegador.
// ---------------------------------------------------------------------

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

// ---------------------------------------------------------------------
// Llamada a Gemini. Le pedimos que responda SOLO JSON con la forma
// exacta de `schema` (salida estructurada).
// ---------------------------------------------------------------------

async function callGemini(env, prompt, schema) {
  const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
  const url = `${GEMINI_BASE_URL}/${model}:generateContent`

  const geminiResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    }),
  })

  if (!geminiResponse.ok) {
    // Se registra en los logs del Worker, pero NO se manda al navegador
    const detail = await geminiResponse.text()
    console.error('Gemini respondió con error', geminiResponse.status, detail)
    throw new Error(`Gemini ${geminiResponse.status}`)
  }

  const data = await geminiResponse.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (typeof text !== 'string') {
    throw new Error('Gemini no devolvió texto')
  }

  // Si el texto no es JSON válido, JSON.parse lanza un error
  return JSON.parse(text)
}

// =====================================================================
// 1) ANÁLISIS DE SCOUTING
// =====================================================================

const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
    recommendation: { type: 'STRING' },
    projection: { type: 'STRING', enum: ['Alta', 'Media', 'Baja'] },
  },
  required: ['summary', 'strengths', 'weaknesses', 'recommendation', 'projection'],
}

function isValidFighter(fighter) {
  return (
    typeof fighter === 'object' &&
    fighter !== null &&
    Number.isInteger(fighter.id) &&
    typeof fighter.name === 'string' &&
    typeof fighter.record === 'object' &&
    fighter.record !== null
  )
}

async function handleScoutingAnalysis(body, env) {
  const fighter = body?.fighter

  if (!isValidFighter(fighter)) {
    return { status: 400, data: { error: 'Datos del luchador inválidos.' } }
  }

  const prompt = `Eres un scout profesional de deportes de combate (boxeo y MMA) en Latinoamérica.
Analiza a este luchador SOLO con los datos dados. No inventes peleas, rivales ni datos que no estén aquí.

Datos del luchador (JSON):
${JSON.stringify(fighter)}

Responde en español:
- summary: una oración con disciplina, récord, estilo, guardia y ciudad.
- strengths: de 2 a 5 fortalezas concretas, citando números del récord cuando ayude.
- weaknesses: de 1 a 4 debilidades o riesgos concretos (inactividad, derrotas, poca experiencia, disponibilidad, edad).
- recommendation: una recomendación clara para un promotor (contratar ya, seguir de cerca, o no priorizar) y por qué.
- projection: "Alta", "Media" o "Baja".`

  const analysis = await callGemini(env, prompt, ANALYSIS_SCHEMA)
  return { status: 200, data: analysis }
}

// =====================================================================
// 2) BÚSQUEDA SEMÁNTICA
// ---------------------------------------------------------------------
// Gemini hace lo "inteligente": entender la frase y decidir si cada
// luchador cumple cada criterio.
// El Worker hace las cuentas: puntaje, filtro y orden. Así el resultado
// es consistente y no depende de que el modelo sume bien.
// =====================================================================

const SEARCH_SCHEMA = {
  type: 'OBJECT',
  properties: {
    criteria: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { label: { type: 'STRING' } },
        required: ['label'],
      },
    },
    evaluations: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          fighterId: { type: 'INTEGER' },
          checks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                label: { type: 'STRING' },
                met: { type: 'BOOLEAN' },
              },
              required: ['label', 'met'],
            },
          },
        },
        required: ['fighterId', 'checks'],
      },
    },
  },
  required: ['criteria', 'evaluations'],
}

async function handleSemanticSearch(body, env) {
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  const fighters = body?.fighters

  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return {
      status: 400,
      data: {
        error: `La búsqueda debe tener entre ${MIN_QUERY_LENGTH} y ${MAX_QUERY_LENGTH} caracteres.`,
      },
    }
  }

  if (!Array.isArray(fighters) || fighters.length === 0 || !fighters.every(isValidFighter)) {
    return { status: 400, data: { error: 'Lista de luchadores inválida.' } }
  }

  const prompt = `Eres el buscador de una plataforma de scouting de boxeo y MMA.
Un promotor escribió esta búsqueda en lenguaje natural:
"${query}"

Paso 1: extrae los criterios concretos y verificables con los datos (guardia, ciudad, disciplina,
poder de KO, disponibilidad, estado, edad, sexo, nivel, experiencia, etc.).
Cada criterio en "criteria" con un "label" corto en español. Ejemplo: "Guardia zurda", "Vive en Guayaquil".
Interpreta con sentido común: "pelear mañana" = availableToFight true; "mucho poder de KO" = 50% o más
de sus victorias por KO o TKO; "activo" = competitiveStatus "Activo".
Si la búsqueda no tiene ningún criterio verificable, devuelve criteria y evaluations vacíos.

Paso 2: para CADA luchador de la lista, en "evaluations", indica para CADA criterio si lo cumple
(met: true/false), usando exactamente el mismo label del paso 1. Usa solo los datos dados.

Luchadores (JSON):
${JSON.stringify(fighters)}`

  const raw = await callGemini(env, prompt, SEARCH_SCHEMA)

  const criteria = Array.isArray(raw?.criteria) ? raw.criteria : []
  const evaluations = Array.isArray(raw?.evaluations) ? raw.evaluations : []
  const knownIds = fighters.map((fighter) => fighter.id)

  const matches = []

  for (const evaluation of evaluations) {
    // Ignoramos ids que el modelo haya inventado
    if (!knownIds.includes(evaluation.fighterId)) {
      continue
    }

    const checks = Array.isArray(evaluation.checks) ? evaluation.checks : []
    const metCount = checks.filter((check) => check.met === true).length
    const score = criteria.length === 0 ? 0 : Math.round((metCount / criteria.length) * 100)

    if (score > 0) {
      matches.push({ fighterId: evaluation.fighterId, score: score, checks: checks })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  return { status: 200, data: { criteria: criteria, matches: matches } }
}

// =====================================================================
// ENTRADA DEL WORKER
// =====================================================================

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env)
    const { pathname } = new URL(request.url)

    // El navegador pregunta primero si puede hacer la petición (CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (request.method === 'GET' && pathname === '/api/health') {
      return jsonResponse({ ok: true }, 200, corsHeaders)
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Ruta no encontrada.' }, 404, corsHeaders)
    }

    if (!env.GEMINI_API_KEY) {
      console.error('Falta el secret GEMINI_API_KEY')
      return jsonResponse({ error: 'El servicio de IA no está configurado.' }, 500, corsHeaders)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'El cuerpo debe ser JSON.' }, 400, corsHeaders)
    }

    try {
      let result

      if (pathname === '/api/scouting-analysis') {
        result = await handleScoutingAnalysis(body, env)
      } else if (pathname === '/api/semantic-search') {
        result = await handleSemanticSearch(body, env)
      } else {
        return jsonResponse({ error: 'Ruta no encontrada.' }, 404, corsHeaders)
      }

      return jsonResponse(result.data, result.status, corsHeaders)
    } catch (error) {
      console.error('Error al llamar a la IA:', error)
      return jsonResponse({ error: 'El proveedor de IA falló.' }, 502, corsHeaders)
    }
  },
}