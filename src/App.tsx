import { useState } from 'react'

import { EmptyState } from './components/empty-state'
import { FighterGrid } from './components/fighter-grid'
import { FighterProfile } from './components/fighter-profile'
import { SearchInput } from './components/search-input'
import { fighters } from './data/fighters'

function App() {
  const [query, setQuery] = useState('')
  const [selectedFighterId, setSelectedFighterId] = useState<number | null>(
    null,
  )

  const normalizedQuery = query.trim().toLowerCase()

  const visibleFighters = fighters.filter((fighter) => {
    const name = fighter.name.toLowerCase()
    const nickname = fighter.nickname.toLowerCase()

    return name.includes(normalizedQuery) || nickname.includes(normalizedQuery)
  })

  const hasNoResults = visibleFighters.length === 0

  const selectedFighter =
    fighters.find((fighter) => fighter.id === selectedFighterId) ?? null

  function handleClearQuery() {
    setQuery('')
  }

  function handleSelectFighter(fighterId: number) {
    setSelectedFighterId(fighterId)
    window.scrollTo(0, 0)
  }

  function handleCloseDetail() {
    setSelectedFighterId(null)
  }

  if (selectedFighter !== null) {
    return (
      <FighterProfile fighter={selectedFighter} onBack={handleCloseDetail} />
    )
  }

  return (
    <main className="buscar">
      <section className="buscar-disciplina">
        <h1>Buscar talento</h1>
        <p className="aviso-demo">
          Búsqueda por texto (nombre o apodo) · Perfiles de prueba, no son
          personas reales
        </p>
      </section>
      <SearchInput value={query} onQueryChange={setQuery} />
      {hasNoResults ? (
        <EmptyState
          message="No encontramos luchadores con ese nombre o apodo"
          onClear={handleClearQuery}
        />
      ) : (
        <FighterGrid
          items={visibleFighters}
          onSelectFighter={handleSelectFighter}
        />
      )}
    </main>
  )
}

export default App