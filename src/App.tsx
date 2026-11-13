import { Modal } from '@mantine/core'
import { useState } from 'react'

import { EmptyState } from './components/empty-state'
import { FighterDetail } from './components/fighter-detail'
import { FighterGrid } from './components/fighter-grid'
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
  const isDetailOpened = selectedFighter !== null

  function handleClearQuery() {
    setQuery('')
  }

  function handleSelectFighter(fighterId: number) {
    setSelectedFighterId(fighterId)
  }

  function handleCloseDetail() {
    setSelectedFighterId(null)
  }

  return (
    <main className="buscar">
      <section className="buscar-disciplina">
        <h1>Buscar talento</h1>
        <p className="aviso-demo">
          Búsqueda por texto (nombre o apodo) · Perfiles de prueba, no son personas
          reales
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

      <Modal
        opened={isDetailOpened}
        onClose={handleCloseDetail}
        title={selectedFighter?.name ?? 'Detalle'}
        centered
        size="sm"
        overlayProps={{ backgroundOpacity: 0.7, blur: 2 }}
        closeButtonProps={{ 'aria-label': 'Cerrar detalle' }}
        classNames={{
          content: 'fs-modal-content',
          header: 'fs-modal-header',
          title: 'fs-modal-title',
          close: 'fs-modal-close',
        }}
      >
        {selectedFighter && (
          <FighterDetail fighter={selectedFighter} onBack={handleCloseDetail} />
        )}
      </Modal>
    </main>
  )
}

export default App