# FightScout (React)

Buscador de luchadores de boxeo y MMA para reclutadores. Proyecto del bootcamp Full Stack de ESPOL.

> Los perfiles son **datos de prueba** inventados (`src/data/fighters.ts`) y no corresponden a personas reales. La búsqueda es **por texto** (nombre o apodo); no usa IA.

## Qué hace

- `/search`: muestra 3 luchadores ficticios y un buscador por nombre o apodo (sin distinguir mayúsculas; una búsqueda vacía muestra todos).
- Si no hay coincidencias, muestra un mensaje y un botón para limpiar la búsqueda.
- `/fighters/:fighterId`: perfil completo de un luchador. "Volver a resultados" conserva el texto buscado.
- Cualquier otra dirección, o un id inválido, muestra "No encontramos esta página".

## Cómo correrlo

```bash
pnpm install
pnpm dev
```

## Stack

React, TypeScript, Vite, React Router y pnpm.

## Pendiente

Búsqueda con IA, registro de perfiles, contacto y edición.