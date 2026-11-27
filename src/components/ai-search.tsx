import type { FormEvent } from 'react'
import { Link } from 'react-router'

import { fighters } from '../data/fighters'
import { getAiProviderName, searchFightersWithAi } from '../services/ai-service'
import type { AiSearchState } from '../types/ai'
import { MAX_QUERY_LENGTH } from '../validators/ai-validators'

type AiSearchProps = {
  state: AiSearchState
  onStateChange: (newState: AiSearchState) => void
}

const EXAMPLE_QUERY =
  'Peleador zurdo, con mucho poder de KO, activo para pelear mañana porque vive en Guayaquil'

export function AiSearch(props: AiSearchProps) {
  const { state, onStateChange } = props
  const isLoading = state.status === 'cargando'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = state.query

    onStateChange({ query, status: 'cargando', result: null, error: '' })

    const response = await searchFightersWithAi(query)

    if (response.ok) {
      onStateChange({ query, status: 'exito', result: response.data, error: '' })
    } else {
      onStateChange({ query, status: 'error', result: null, error: response.error })
    }
  }

  function handleQueryChange(newQuery: string) {
    onStateChange({ ...state, query: newQuery })
  }

  return (
    <div className="ia-busqueda">
      <form className="filtro-grupo ia-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="ai-search">Describe al luchador que buscas</label>
        <textarea
          id="ai-search"
          rows={3}
          maxLength={MAX_QUERY_LENGTH}
          value={state.query}
          disabled={isLoading}
          placeholder={`Ej: ${EXAMPLE_QUERY}`}
          onChange={(event) => handleQueryChange(event.currentTarget.value)}
        />
        <div className="ia-acciones">
          <button type="submit" className="btn btn-primario" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar con IA'}
          </button>
          <button
            type="button"
            className="btn btn-fantasma"
            onClick={() => handleQueryChange(EXAMPLE_QUERY)}
            disabled={isLoading}
          >
            Usar ejemplo
          </button>
        </div>
      </form>

      {isLoading && (
        <p className="ia-cargando" role="status">
          La IA está interpretando tu búsqueda...
        </p>
      )}

      {state.status === 'error' && (
        <div className="ia-error" role="alert">
          <p>{state.error}</p>
        </div>
      )}

      {state.status === 'exito' && state.result !== null && (
        <AiSearchResults result={state.result} />
      )}
    </div>
  )
}

// ---------- Resultados ----------

type AiSearchResultsProps = {
  result: NonNullable<AiSearchState['result']>
}

function AiSearchResults(props: AiSearchResultsProps) {
  const { criteria, matches } = props.result

  if (criteria.length === 0) {
    return (
      <div className="estado-vacio" role="status">
        <p>
          No pude identificar criterios en tu búsqueda. Prueba mencionando
          guardia (zurdo, ortodoxo), ciudad, disciplina, poder de KO o
          disponibilidad.
        </p>
      </div>
    )
  }

  return (
    <div className="ia-resultado" role="status">
      <p className="ia-ayuda">
        La IA ({getAiProviderName()}) entendió estos criterios:
      </p>
      <div className="estilo-tags">
        {criteria.map((criterion) => (
          <span key={criterion.label} className="tag">
            {criterion.label}
          </span>
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="ia-ayuda">Ningún luchador cumple esos criterios.</p>
      ) : (
        <ol className="tarjetas-peleadores ia-ranking">
          {matches.map((match) => {
            const fighter = fighters.find((item) => item.id === match.fighterId)

            // Ya se validó que el id existe; esto es solo por seguridad.
            if (fighter === undefined) {
              return null
            }

            return (
              <li key={match.fighterId} className="tarjeta-peleador">
                <div className="tarjeta-info">
                  <p className="tarjeta-nombre">
                    {fighter.name}
                    <span className="tarjeta-meta">
                      {fighter.nickname} · {fighter.discipline} · {fighter.city}
                    </span>
                  </p>
                  <p className="ia-coincidencia">{match.score}% de coincidencia</p>
                  <ul className="ia-checks">
                    {match.checks.map((check) => (
                      <li
                        key={check.label}
                        className={check.met ? 'ia-check-si' : 'ia-check-no'}
                      >
                        {check.met ? '✔' : '✘'} {check.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="tarjeta-acciones">
                  <Link className="btn btn-primario" to={`/fighters/${fighter.id}`}>
                    Ver detalle
                  </Link>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}