import React from 'react'
import { TYPE_TRANSLATIONS } from '../../api/localization'
import { GENERATIONS } from '../../api/pokeApi'
import { IconSearch, IconClose } from '../ui/Icons'

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  selectedGen: string
  onGenChange: (value: string) => void
  onReset?: () => void
  totalCount?: number
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedGen,
  onGenChange,
  onReset,
  totalCount,
}) => {
  const typeKeys = Object.keys(TYPE_TRANSLATIONS)
  const hasFilters = searchTerm.trim() !== '' || selectedType !== '' || selectedGen !== ''

  return (
    <section className="field-search-bar" aria-label="Fichário de Busca">
      <div className="search-controls">
        {/* Campo de Busca por Nome ou Número */}
        <div className="search-input-wrapper">
          <IconSearch className="search-icon-lens" size={18} />
          <input
            type="search"
            className="search-field-input"
            placeholder="Buscar por nome ou número (ex: 25, Gengar, Mimikyu, Chikorita)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Pesquisar espécime de Pokémon"
          />
        </div>

        {/* Filtros em Linha: Geração e Tipo */}
        <div className="filter-group">
          {/* Filtro por Geração */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label htmlFor="gen-filter-select" style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
              Geração:
            </label>
            <select
              id="gen-filter-select"
              className="filter-select"
              value={selectedGen}
              onChange={(e) => onGenChange(e.target.value)}
            >
              <option value="">Todas as Gerações</option>
              {GENERATIONS.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label htmlFor="type-filter-select" style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
              Tipo:
            </label>
            <select
              id="type-filter-select"
              className="filter-select"
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              {typeKeys.map((key) => (
                <option key={key} value={key}>
                  {TYPE_TRANSLATIONS[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de Limpeza de Filtros */}
          {hasFilters && onReset && (
            <button
              type="button"
              className="vintage-btn"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              onClick={onReset}
              title="Limpar todos os filtros"
            >
              <IconClose size={13} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="museum-tag">
          {totalCount ? `Catálogo com ${totalCount} Espécimes Descobertos` : 'Fichário Científico Universal'}
        </span>
        <span className="handwritten" style={{ fontSize: '18px', color: 'var(--ink-secondary)' }}>
          "Consulte o índice para localizar anotações anatômicas."
        </span>
      </div>
    </section>
  )
}
