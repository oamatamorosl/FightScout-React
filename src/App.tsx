import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { PublicLayout } from './layouts/public-layout'
import { FighterProfilePage } from './pages/fighter-profile-page'
import { NotFoundPage } from './pages/not-found-page'
import { SearchPage } from './pages/search-page'

function App() {
  const [query, setQuery] = useState('')

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Navigate to="/search" replace />} />
        <Route
          path="search"
          element={<SearchPage query={query} onQueryChange={setQuery} />}
        />
        <Route path="fighters/:fighterId" element={<FighterProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App