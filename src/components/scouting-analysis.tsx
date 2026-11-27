import { useState } from 'react'

import {
  generateScoutingAnalysis,
  getAiProviderName,
} from '../services/ai-service'
import type { ScoutingAnalysis as Analysis } from '../types/ai'
import type { Fighter } from '../types/fighter'

type ScoutingAnalysisProps = {
  fighter: Fighter
}

// Los 4 estados posibles de la sección
type Status = 'inicial' | 'cargando' | 'exito' | 'error'

export function ScoutingAnalysis(props: ScoutingAnalysisProps) {
  const { fighter } = props

  const [status, setStatus] = useState<Status>('inicial')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleGenerate() {
    setStatus('cargando')

    const response = await generateScoutingAnalysis(fighter)

    if (response.ok) {
      setAnalysis(response.data)
      setStatus('exito')
    } else {
      setErrorMessage(response.error)
      setStatus('error')
    }
  }

  const isLoading = status === 'cargando'

  return (
    <section className="ia-analisis" aria-labelledby="ia-analisis-titulo">
      <div className="ia-cabecera">
        <h2 className="perfil-h2" id="ia-analisis-titulo">
          Análisis de scouting
        </h2>
        <span className="ia-sello">IA · {getAiProviderName()}</span>
      </div>

      {status === 'inicial' && (
        <p className="ia-ayuda">
          Genera un resumen con fortalezas, debilidades y una recomendación a
          partir del récord y el perfil del luchador.
        </p>
      )}

      {isLoading && (
        <p className="ia-cargando" role="status">
          Analizando a {fighter.name}...
        </p>
      )}

      {status === 'error' && (
        <div className="ia-error" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      {status === 'exito' && analysis !== null && (
        <div className="ia-resultado" role="status">
          <p className="ia-resumen">{analysis.summary}</p>

          <p className="ia-proyeccion">
            Proyección:{' '}
            <span className={`ia-nivel ia-nivel-${analysis.projection.toLowerCase()}`}>
              {analysis.projection}
            </span>
          </p>

          <div className="ia-columnas">
            <div>
              <h3 className="ia-h3">Fortalezas</h3>
              <ul className="ia-lista">
                {analysis.strengths.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="ia-h3">Debilidades</h3>
              <ul className="ia-lista">
                {analysis.weaknesses.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="ia-recomendacion">
            <strong>Recomendación:</strong> {analysis.recommendation}
          </p>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primario"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {status === 'inicial' && 'Generar análisis de scouting'}
        {status === 'cargando' && 'Generando...'}
        {status === 'exito' && 'Volver a generar'}
        {status === 'error' && 'Reintentar'}
      </button>
    </section>
  )
}