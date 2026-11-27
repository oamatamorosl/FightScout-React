# Registro de versiones publicadas

Sitio: http://fightscout-oscar-matamoros.s3-website-us-east-1.amazonaws.com

Trazabilidad: **commit → CI (GitHub Actions) → build (artifact `dist`) → publicación (S3)**

| Versión | Commit | CI (push) | CD (build + deploy a S3) | Qué incluye |
|---|---|---|---|---|
| v1 | `9028741` | — | CI/CD #20 | Integración IA (Gemini vía Worker): análisis de scouting y búsqueda semántica, con validación y errores controlados |
| v2 | `ba6d587` | CI/CD #21 | CI/CD #22 | Pie de página con la versión 2.0 |

## Qué cambió entre v1 y v2

- Archivo modificado: `src/layouts/public-layout.tsx`
- Se agregó un pie de página con el texto *"Versión 2.0 · Análisis de scouting y búsqueda semántica con IA (Gemini)"*.
- No cambió la lógica de la IA ni los datos.

## Cómo se publicó cada versión

1. `git push` a `main` → GitHub Actions ejecuta lint, 14 pruebas y build (job `build`), y guarda `dist/` como artifact.
2. **Actions → CI/CD → Run workflow** → el job `deploy` descarga ese artifact y lo sincroniza con el bucket S3 (`aws s3 sync dist s3://fightscout-oscar-matamoros --delete`).

## Evidencias

- `v1-antes.png`: sitio en S3 sin pie de página.
- `v2-despues.png`: sitio en S3 con el pie "Versión 2.0".
- Capturas de CI/CD #20 y #22 con `build` y `deploy` en verde.
