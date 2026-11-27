# FightScout (React)

Buscador de luchadores de boxeo y MMA para reclutadores y promotores de Latinoamérica. Proyecto del bootcamp Full Stack de ESPOL, módulo **AI Integration & Cloud Deployment**.

> Los perfiles son **datos de prueba** inventados (`src/data/fighters.ts`) y no corresponden a personas reales.

**Sitio publicado (S3):** http://fightscout-oscar-matamoros.s3-website-us-east-1.amazonaws.com

## Qué hace

- **Búsqueda por nombre o apodo** (`/search` → "Por nombre").
- **Búsqueda semántica con IA** (`/search` → "Con IA"): se describe al luchador en lenguaje natural, por ejemplo *"Peleador zurdo, con mucho poder de KO, activo para pelear mañana porque vive en Guayaquil"*. La IA extrae los criterios y ordena a los luchadores por porcentaje de coincidencia, mostrando qué criterios cumple cada uno.
- **Análisis de scouting con IA** (`/fighters/:id` → "Generar análisis de scouting"): resumen, fortalezas, debilidades, proyección (Alta/Media/Baja) y recomendación para un promotor.
- Estados visibles en ambas funciones: **inicial, cargando, éxito y error controlado**.

## Instalación

**Requisitos:** Node.js LTS (22 o superior) y pnpm. Si no tienes pnpm: `corepack enable` (o `npm install -g pnpm`).

```bash
pnpm install        # instalar dependencias
pnpm dev            # ejecutar en local -> http://localhost:5173
pnpm test           # ejecutar las pruebas (Vitest)
pnpm run lint       # validar calidad del código
pnpm run build      # generar el build de producción en dist/
```

## Configuración pública

Copia `.env.example` como `.env.local` y define la URL del servicio de IA:

```
VITE_AI_API_URL=https://fightscout-ai.osalmalo2007.workers.dev
```

| Variable | Dónde | Qué es |
|---|---|---|
| `VITE_AI_API_URL` | `.env.local` (local) y *Variable* del repositorio en GitHub (CI) | URL **pública** del backend de IA. Si está vacía, la app usa el **simulador** |
| `?simular=fallo` / `?simular=invalido` | En la URL del navegador | Fuerzan un error del servicio o una respuesta inválida, para probar los errores controlados |

**Seguridad:** toda variable `VITE_` queda dentro del frontend publicado, por eso aquí **solo hay una URL**. La API key de Gemini **no está en el frontend ni en el repositorio**: vive como *secret* del Worker de Cloudflare (`wrangler secret put GEMINI_API_KEY`). Las credenciales de AWS están como *Secrets* de GitHub Actions.

## Arquitectura

```
Navegador ──▶ Amazon S3 (sitio estático: HTML, JS, CSS de dist/)
   │
   └─ fetch HTTPS ──▶ Cloudflare Worker (worker/) ──▶ Google Gemini (gemini-3.5-flash-lite)
                      guarda GEMINI_API_KEY             responde JSON estructurado
```

| Parte | Qué es | Dónde está |
|---|---|---|
| **Frontend** | React + TypeScript + Vite + React Router | `src/`, publicado en Amazon S3 |
| **Backend / API** | Cloudflare Worker con `/api/scouting-analysis` y `/api/semantic-search`. Guarda la API key, llama a Gemini, aplica CORS y devuelve errores controlados | `worker/` |
| **Proveedor de IA** | Google Gemini (`gemini-3.5-flash-lite`) con salida JSON estructurada (`responseSchema`) | Externo |
| **Simulador (mock)** | Genera respuestas con reglas, sin IA real. Se usa si no hay `VITE_AI_API_URL` o con `?simular=` | `src/services/ai-mock-server.ts` |

**Flujo de cada llamada a la IA** (`src/services/ai-service.ts`):

1. Validar la entrada (`src/validators/ai-validators.ts`). Si es inválida, no se llama a la IA.
2. Llamar al Worker (timeout de 25 s) o al simulador.
3. Validar la respuesta antes de mostrarla (formato, valores permitidos, que los ids de luchadores existan).
4. Devolver `{ ok: true, data }` o `{ ok: false, error }`. La interfaz muestra un mensaje controlado y nunca se rompe.

### De `git push` al sitio publicado

```
git push ──▶ GitHub Actions (.github/workflows/ci.yml)
               job build:  pnpm install → lint → pruebas (Vitest) → build (tsc + Vite)
                           → artifact "dist"
               job deploy (manual: Actions → CI/CD → Run workflow):
                           descarga el artifact → aws s3 sync dist s3://fightscout-oscar-matamoros
                                                  ──▶ hosting estático de S3 ──▶ navegador
```

- **Instalación:** `pnpm install --frozen-lockfile` instala exactamente las versiones del `pnpm-lock.yaml`.
- **Build:** `tsc -b` comprueba los tipos y `vite build` genera `dist/` (solo archivos estáticos; **no contiene el backend**).
- **Artifact:** `dist/` se guarda en la ejecución de GitHub Actions.
- **Hosting:** S3 sirve los archivos con *Static website hosting*. `index.html` es documento de índice **y de error**, para que React Router funcione al recargar una ruta como `/fighters/4`.
- **CDN:** no se usa. S3 sirve el sitio directamente; CloudFront sería la capa de CDN y HTTPS.

El registro de versiones publicadas está en [`docs/registro-versiones.md`](docs/registro-versiones.md).

### Backend (Worker)

```bash
cd worker
pnpm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY   # la key no queda en el repositorio
pnpm run deploy
```

Los orígenes permitidos (CORS) se configuran en `ALLOWED_ORIGINS` de `worker/wrangler.toml`.

## Limitaciones

- **Sin HTTPS en el sitio:** el endpoint de sitio web de S3 es solo HTTP. Para HTTPS y CDN haría falta CloudFront.
- **AWS Academy Learner Lab:** las credenciales caducan en cada sesión (unas 4 horas). Por eso el despliegue a S3 es **manual** (`workflow_dispatch`) y hay que actualizar los Secrets de GitHub antes de publicar.
- **Backend fuera de AWS:** el backend de IA está en Cloudflare Workers y no en AWS, porque se necesitaba un endpoint HTTPS público que no dependa de la sesión del laboratorio.
- **Sin límite de uso:** la URL del Worker es pública; cualquiera podría consumir la cuota gratuita de Gemini. CORS solo protege frente a navegadores, no frente a llamadas directas.
- **Calidad de la IA:** Gemini puede dar respuestas distintas para el mismo luchador o juicios discutibles. La app valida el **formato** de la respuesta, no si el contenido es correcto: las sugerencias requieren revisión humana.
- **Nivel gratuito de Gemini:** tiene límites por minuto; con muchas peticiones seguidas el servicio puede responder error (se muestra el mensaje controlado).
- **Simulador limitado:** entiende solo palabras clave conocidas (guardia, ciudad, disciplina, KO, disponibilidad, etc.).
- **Datos de prueba:** 8 luchadores ficticios en el código; no hay base de datos, registro ni edición de perfiles.

## Stack

React 19, TypeScript, Vite, React Router, Vitest, pnpm, GitHub Actions, Amazon S3, Cloudflare Workers, Google Gemini.
