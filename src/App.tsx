import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { PublicLayout } from './layouts/public-layout'
import { FighterProfilePage } from './pages/fighter-profile-page'
import { NotFoundPage } from './pages/not-found-page'
import { SearchPage } from './pages/search-page'
import { initialAiSearchState } from './types/ai'
import type { AiSearchState, SearchMode } from './types/ai'

function App() {
  const [query, setQuery] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('texto')
  const [aiSearch, setAiSearch] = useState<AiSearchState>(initialAiSearchState)

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Navigate to="/search" replace />} />
        <Route
          path="search"
          element={
            <SearchPage
              query={query}
              onQueryChange={setQuery}
              mode={searchMode}
              onModeChange={setSearchMode}
              aiSearch={aiSearch}
              onAiSearchChange={setAiSearch}
            />
          }
        />
        <Route path="fighters/:fighterId" element={<FighterProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App