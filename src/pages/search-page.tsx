import { AiSearch } from '../components/ai-search'
import { EmptyState } from '../components/empty-state'
import { FighterGrid } from '../components/fighter-grid'
import { SearchInput } from '../components/search-input'
import { fighters } from '../data/fighters'
import type { AiSearchState, SearchMode } from '../types/ai'

type SearchPageProps = {
  query: string
  onQueryChange: (value: string) => void
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  aiSearch: AiSearchState
  onAiSearchChange: (state: AiSearchState) => void
}

export function SearchPage(props: SearchPageProps) {
  const { query, onQueryChange, mode, onModeChange, aiSearch, onAiSearchChange } =
    props

  const normalizedQuery = query.trim().toLowerCase()

  const visibleFighters = fighters.filter((fighter) => {
    const name = fighter.name.toLowerCase()
    const nickname = fighter.nickname.toLowerCase()

    return name.includes(normalizedQuery) || nickname.includes(normalizedQuery)
  })

  const hasNoResults = visibleFighters.length === 0

  function handleClearQuery() {
    onQueryChange('')
  }

  return (
    <div className="buscar">
      <section className="buscar-disciplina">
        <h1>Buscar talento</h1>
        <p className="aviso-demo">
          Perfiles de prueba, no son personas reales
        </p>
      </section>

      <div className="modo-busqueda" role="group" aria-label="Tipo de búsqueda">
        <button
          type="button"
          className={mode === 'texto' ? 'btn btn-primario' : 'btn btn-fantasma'}
          aria-pressed={mode === 'texto'}
          onClick={() => onModeChange('texto')}
        >
          Por nombre
        </button>
        <button
          type="button"
          className={mode === 'ia' ? 'btn btn-primario' : 'btn btn-fantasma'}
          aria-pressed={mode === 'ia'}
          onClick={() => onModeChange('ia')}
        >
          Con IA
        </button>
      </div>

      {mode === 'texto' && (
        <>
          <SearchInput value={query} onQueryChange={onQueryChange} />
          {hasNoResults ? (
            <EmptyState
              message="No encontramos luchadores con ese nombre o apodo"
              onClear={handleClearQuery}
            />
          ) : (
            <FighterGrid items={visibleFighters} />
          )}
        </>
      )}

      {mode === 'ia' && (
        <AiSearch state={aiSearch} onStateChange={onAiSearchChange} />
      )}
    </div>
  )
}