// =====================================================================
// CLIENTE HTTP DEL BACKEND DE IA (Cloudflare Worker con Gemini)
// ---------------------------------------------------------------------
// Este archivo NO tiene ninguna API key. Solo conoce la URL pública del
// Worker. La key la guarda el Worker como secret.
// =====================================================================

const TIMEOUT_MS = 25000

// Hace POST al Worker y devuelve el JSON tal cual llegó (unknown).
// Si el Worker no responde, tarda demasiado o responde con error, lanza un Error.
export async function postToAiApi(path: string, body: unknown): Promise<unknown> {
  const baseUrl = import.meta.env.VITE_AI_API_URL

  if (!baseUrl) {
    throw new Error('Falta VITE_AI_API_URL')
  }

  // Si pasan TIMEOUT_MS sin respuesta, cancelamos la petición
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`El backend de IA respondió ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}