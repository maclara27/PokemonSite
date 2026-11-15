import React from 'react'
import { IconBook, IconCatalog } from '../ui/Icons'

interface JournalLayoutProps {
  children: React.ReactNode
  activePage: 'home' | 'catalog' | 'detail'
  onNavigate: (path: string) => void
}

export const JournalLayout: React.FC<JournalLayoutProps> = ({
  children,
  activePage,
  onNavigate,
}) => {
  return (
    <div className="expedition-desk">
      <main className="journal-page">
        {/* Cabeçalho da Página */}
        <header className="journal-header">
          <div className="journal-header-top">
            <div className="journal-title-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="rubber-stamp stamp-kanto">Catálogo Oficial</span>
                <span className="rubber-stamp stamp-official">Gerações I a IX • Base Completa</span>
              </div>
              <h1 style={{ marginTop: '0.4rem', marginBottom: '0.1rem' }}>
                Listagem de Pokémons
              </h1>
              <p className="journal-subtitle">
                Consulte habilidades, atributos, linhagens evolutivas e curiosidades de todos os Pokémon
              </p>
            </div>

            {/* Marcadores de Página / Navegação */}
            <nav className="journal-nav" aria-label="Navegação Principal">
              <button
                type="button"
                className={`nav-bookmark ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => onNavigate('#/')}
              >
                <IconBook size={16} />
                <span>Início</span>
              </button>
              <button
                type="button"
                className={`nav-bookmark ${activePage === 'catalog' ? 'active' : ''}`}
                onClick={() => onNavigate('#/catalogo')}
              >
                <IconCatalog size={16} />
                <span>Listagem de Pokémons</span>
              </button>
            </nav>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="journal-main">
          {children}
        </div>

        {/* Rodapé Oficial */}
        <footer className="journal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="rubber-stamp stamp-official" style={{ fontSize: '0.65rem' }}>
              Listagem de Pokémons
            </span>
            <span className="museum-tag">
              Catálogo interativo com 1025 espécies catalogadas
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem', opacity: 0.9 }}>
            Ilustrações oficiais com tratamento litográfico • Informações completas em Português
          </p>
        </footer>
      </main>
    </div>
  )
}
