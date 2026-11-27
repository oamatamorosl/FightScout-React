/// <reference types="vite/client" />

// Variables de entorno públicas que usa la app.
// OJO: todo lo que empieza con VITE_ termina dentro de dist/ (es público).
// Aquí NUNCA va una API key.
interface ImportMetaEnv {
  // URL del Worker de IA. Si no existe, la app usa el simulador (mock).
  readonly VITE_AI_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}