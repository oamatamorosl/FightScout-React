import { EmptyState } from '../components/empty-state'
import { FighterGrid } from '../components/fighter-grid'
import { SearchInput } from '../components/search-input'
import { fighters } from '../data/fighters'

type SearchPageProps = {
  query: string
  onQueryChange: (value: string) => void
}

export function SearchPage(props: SearchPageProps) {
  const { query, onQueryChange } = props

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
          Búsqueda por texto (nombre o apodo) · Perfiles de prueba, no son
          personas reales
        </p>
      </section>
      <SearchInput value={query} onQueryChange={onQueryChange} />
      {hasNoResults ? (
        <EmptyState
          message="No encontramos luchadores con ese nombre o apodo"
          onClear={handleClearQuery}
        />
      ) : (
        <FighterGrid items={visibleFighters} />
      )}
    </div>
  )
}