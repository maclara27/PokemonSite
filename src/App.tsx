import React from 'react'
import { JournalLayout } from './components/layout/JournalLayout'
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { DetailPage } from './pages/DetailPage'
import { useHashRoute } from './hooks/useHashRoute'

// Importação da folha de estilos em CSS puro
import './styles/reset.css'
import './styles/variables.css'
import './styles/textures.css'
import './styles/typography.css'
import './styles/artwork.css'
import './styles/layout.css'

export const App: React.FC = () => {
  const { page, pokemonId, navigate } = useHashRoute()

  return (
    <JournalLayout activePage={page} onNavigate={navigate}>
      {page === 'home' && (
        <HomePage
          onSelectPokemon={(id) => navigate(`#/pokemon/${id}`)}
          onNavigateToCatalog={() => navigate('#/catalogo')}
        />
      )}

      {page === 'catalog' && (
        <CatalogPage
          onSelectPokemon={(id) => navigate(`#/pokemon/${id}`)}
        />
      )}

      {page === 'detail' && (
        <DetailPage
          pokemonId={pokemonId || 1}
          onBackToCatalog={() => navigate('#/catalogo')}
          onSelectPokemon={(id) => navigate(`#/pokemon/${id}`)}
        />
      )}
    </JournalLayout>
  )
}

export default App

