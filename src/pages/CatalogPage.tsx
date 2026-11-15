import React, { useState, useEffect, useMemo } from 'react'
import { SearchFilter } from '../components/pokemon/SearchFilter'
import { SpecimenCard } from '../components/pokemon/SpecimenCard'
import {
  getPokemon,
  getAllPokemonList,
  normalizeText,
  GENERATIONS,
} from '../api/pokeApi'
import { IconScroll } from '../components/ui/Icons'
import type { Pokemon, PokemonListItem } from '../api/types'

interface CatalogPageProps {
  onSelectPokemon: (id: number) => void
}

const BATCH_SIZE = 24

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectPokemon }) => {
  const [allList, setAllList] = useState<PokemonListItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(1025)
  const [loadingList, setLoadingList] = useState<boolean>(true)

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedGen, setSelectedGen] = useState<string>('')

  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE)
  const [detailsMap, setDetailsMap] = useState<Record<number, Pokemon>>({})
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false)

  // 1. Carrega a lista global de espécies
  useEffect(() => {
    getAllPokemonList()
      .then(res => {
        setAllList(res.items)
        setTotalCount(res.totalCount)
        setLoadingList(false)
      })
      .catch(err => {
        console.error('Erro ao carregar catálogo completo:', err)
        setLoadingList(false)
      })
  }, [])

  // 2. Filtra por geração e por termo de busca (sem acentos)
  const filteredList = useMemo(() => {
    let list = allList

    // Filtro por Geração
    if (selectedGen) {
      const genRange = GENERATIONS.find(g => g.id === selectedGen)
      if (genRange) {
        list = list.filter(item => item.id >= genRange.start && item.id <= genRange.end)
      }
    }

    // Busca por Nome sem acento ou por Número
    if (searchTerm.trim()) {
      const normalizedQuery = normalizeText(searchTerm)
      const rawNumber = searchTerm.trim().replace(/^0+/, '')

      list = list.filter(item => {
        const normalizedName = normalizeText(item.name)
        const matchesName = normalizedName.includes(normalizedQuery)
        const matchesId = String(item.id) === rawNumber || String(item.id).padStart(3, '0') === searchTerm.trim()
        return matchesName || matchesId
      })
    }

    return list
  }, [allList, searchTerm, selectedGen])

  // Lote atualmente visível
  const itemsToDisplay = useMemo(() => {
    return filteredList.slice(0, visibleCount)
  }, [filteredList, visibleCount])

  // 3. Carrega detalhes sob demanda dos itens visíveis
  useEffect(() => {
    if (itemsToDisplay.length === 0) return

    let isMounted = true
    const idsToFetch = itemsToDisplay
      .map(item => item.id)
      .filter(id => !detailsMap[id])

    if (idsToFetch.length === 0) return

    setLoadingDetails(true)
    Promise.all(idsToFetch.map(id => getPokemon(id).catch(() => null)))
      .then(fetched => {
        if (!isMounted) return
        setDetailsMap(prev => {
          const next = { ...prev }
          fetched.forEach(p => {
            if (p) next[p.id] = p
          })
          return next
        })
      })
      .catch(err => console.error('Erro ao carregar detalhes do lote:', err))
      .finally(() => {
        if (isMounted) setLoadingDetails(false)
      })

    return () => {
      isMounted = false
    }
  }, [itemsToDisplay, detailsMap])

  // 4. Aplica filtro por Tipo
  const finalPokemonList = useMemo(() => {
    const list = itemsToDisplay
      .map(item => detailsMap[item.id])
      .filter((p): p is Pokemon => Boolean(p))

    if (!selectedType) return list

    return list.filter(p =>
      p.types.some(t => t.type.name.toLowerCase() === selectedType.toLowerCase())
    )
  }, [itemsToDisplay, detailsMap, selectedType])

  const hasMore = visibleCount < filteredList.length

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredList.length))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Cabeçalho da Seção */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="rubber-stamp stamp-kanto">Arquivo Geral</span>
            <span className="rubber-stamp stamp-official">{totalCount} Espécimes</span>
          </div>
          <h2 style={{ fontSize: '1.9rem', marginTop: '0.4rem', marginBottom: '0.2rem' }}>
            Listagem de Pokémons
          </h2>
          <p className="handwritten" style={{ fontSize: '1.05rem', color: 'var(--ink-secondary)' }}>
            Exibindo todos os Pokémon de todas as regiões com ilustrações e dados anatômicos
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="specimen-number" style={{ fontSize: '1.1rem' }}>
            {finalPokemonList.length} de {filteredList.length} localizados
          </span>
        </div>
      </div>

      {/* Controles de Busca e Filtro */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setVisibleCount(BATCH_SIZE)
        }}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGen={selectedGen}
        onGenChange={(val) => {
          setSelectedGen(val)
          setVisibleCount(BATCH_SIZE)
        }}
        totalCount={totalCount}
        onReset={() => {
          setSearchTerm('')
          setSelectedType('')
          setSelectedGen('')
          setVisibleCount(BATCH_SIZE)
        }}
      />

      {/* Grid de Espécimes */}
      {loadingList ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p className="handwritten" style={{ fontSize: '22px' }}>
            Abrindo os arquivos e organizando as gavetas do fichário...
          </p>
        </div>
      ) : finalPokemonList.length > 0 ? (
        <>
          <div className="specimen-grid">
            {finalPokemonList.map((pokemon, idx) => (
              <SpecimenCard
                key={pokemon.id}
                pokemon={pokemon}
                index={idx}
                onSelect={onSelectPokemon}
              />
            ))}
          </div>

          {/* Botão de Carga Sob Demanda */}
          {hasMore && (
            <div style={{ textAlign: 'center', margin: '3.5rem 0 2rem' }}>
              <button
                type="button"
                className="vintage-btn vintage-btn-primary"
                style={{ padding: '0.85rem 2.2rem', fontSize: '1.05rem', gap: '0.6rem' }}
                onClick={handleLoadMore}
                disabled={loadingDetails}
              >
                {loadingDetails ? (
                  <span>Folheando manuscritos...</span>
                ) : (
                  <>
                    <IconScroll size={17} />
                    <span>Folhear Mais Anotações... (+{Math.min(BATCH_SIZE, filteredList.length - visibleCount)} espécimes)</span>
                  </>
                )}
              </button>
              <p className="handwritten" style={{ marginTop: '0.6rem', color: 'var(--ink-secondary)', fontSize: '18px' }}>
                Exibindo {visibleCount} de {filteredList.length} fichas
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="handwritten-note-box" style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '2rem 0' }}>
          <p style={{ fontSize: '20px' }}>
            Nenhum espécime encontrado com os filtros selecionados.
          </p>
          <p style={{ fontSize: '18px', marginTop: '0.4rem', color: 'var(--ink-muted)' }}>
            Tente redefinir a busca ou selecionar outra geração ou tipo.
          </p>
        </div>
      )}
    </div>
  )
}
