import React, { useState, useEffect, useMemo } from 'react'
import { FeaturedSpecimen } from '../components/pokemon/FeaturedSpecimen'
import { SearchFilter } from '../components/pokemon/SearchFilter'
import { SpecimenCard } from '../components/pokemon/SpecimenCard'
import {
  getPokemon,
  getAllPokemonList,
  normalizeText,
  GENERATIONS,
} from '../api/pokeApi'
import { IconCatalog, IconArrowRight } from '../components/ui/Icons'
import type { Pokemon, PokemonListItem } from '../api/types'

interface HomePageProps {
  onSelectPokemon: (id: number) => void
  onNavigateToCatalog: () => void
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPokemon,
  onNavigateToCatalog,
}) => {
  const [featuredPokemon, setFeaturedPokemon] = useState<Pokemon | null>(null)
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true)

  const [allList, setAllList] = useState<PokemonListItem[]>([])
  const [totalSpeciesCount, setTotalSpeciesCount] = useState<number>(1025)

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedGen, setSelectedGen] = useState<string>('')

  // Cache de detalhes dos Pokémon buscados
  const [detailsMap, setDetailsMap] = useState<Record<number, Pokemon>>({})
  const [loadingResults, setLoadingResults] = useState<boolean>(false)

  // Amostras clássicas (iniciais e representantes marcantes de diferentes gerações)
  const sampleIds = useMemo(() => [1, 4, 7, 25, 133, 152, 155, 158, 252, 778], [])
  const [samples, setSamples] = useState<Pokemon[]>([])

  // 1. Carrega a lista universal de espécies e total real
  useEffect(() => {
    getAllPokemonList()
      .then(res => {
        setAllList(res.items)
        setTotalSpeciesCount(res.totalCount)
      })
      .catch(err => console.error('Erro ao carregar catálogo completo:', err))
  }, [])

  // 2. Carrega Pokémon em destaque aleatório de qualquer geração existente
  const loadRandomFeatured = async () => {
    setLoadingFeatured(true)
    try {
      const maxId = totalSpeciesCount > 0 ? totalSpeciesCount : 1025
      const randomId = Math.floor(Math.random() * maxId) + 1
      const data = await getPokemon(randomId)
      setFeaturedPokemon(data)
    } catch (err) {
      console.error('Erro ao sortear espécime:', err)
      // Fallback seguro caso dê erro em ID alto
      try {
        const fallback = await getPokemon(25)
        setFeaturedPokemon(fallback)
      } catch {}
    } finally {
      setLoadingFeatured(false)
    }
  }

  useEffect(() => {
    loadRandomFeatured()
  }, [totalSpeciesCount])

  // 3. Carrega amostras fundamentais
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const promises = sampleIds.map(id => getPokemon(id))
        const results = await Promise.all(promises)
        setSamples(results)
      } catch (err) {
        console.error('Erro ao carregar amostras:', err)
      }
    }
    fetchSamples()
  }, [sampleIds])

  // 4. Filtro por Busca (sem acentos) e Geração
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

    return list.slice(0, 24) // Limite de 24 para resposta ágil na Home
  }, [allList, searchTerm, selectedGen])

  // 5. Carrega detalhes dos itens filtrados
  useEffect(() => {
    if (filteredList.length === 0) return

    let isMounted = true
    const idsToFetch = filteredList
      .map(item => item.id)
      .filter(id => !detailsMap[id])

    if (idsToFetch.length === 0) return

    setLoadingResults(true)
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
      .finally(() => {
        if (isMounted) setLoadingResults(false)
      })

    return () => {
      isMounted = false
    }
  }, [filteredList, detailsMap])

  const isFiltering = searchTerm.trim() !== '' || selectedType !== '' || selectedGen !== ''

  // Lista final após filtro de tipo
  const searchResultPokemons = useMemo(() => {
    if (!isFiltering) return []

    let list = filteredList
      .map(item => detailsMap[item.id])
      .filter((p): p is Pokemon => Boolean(p))

    if (selectedType) {
      list = list.filter(p =>
        p.types.some(t => t.type.name.toLowerCase() === selectedType.toLowerCase())
      )
    }

    return list
  }, [isFiltering, filteredList, detailsMap, selectedType])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Citação de Abertura */}
      <section style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p className="handwritten" style={{ fontSize: '1.15rem', color: 'var(--ink-secondary)', maxWidth: '780px', margin: '0 auto', lineHeight: '1.6' }}>
          "Explore a Listagem de Pokémons com parâmetros anatômicos, atributos de combate, linhagens evolutivas e habilidades de todas as gerações conhecidas."
        </p>
        <span className="museum-tag" style={{ display: 'block', marginTop: '0.45rem' }}>
          — Guia Oficial de Espécies
        </span>
      </section>

      {/* Espécime em Destaque */}
      <FeaturedSpecimen
        pokemon={featuredPokemon}
        loading={loadingFeatured}
        onSelect={onSelectPokemon}
        onReroll={loadRandomFeatured}
      />

      {/* Barra de Pesquisa e Filtros */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGen={selectedGen}
        onGenChange={setSelectedGen}
        totalCount={totalSpeciesCount}
        onReset={() => {
          setSearchTerm('')
          setSelectedType('')
          setSelectedGen('')
        }}
      />

      {/* Exibição dos Resultados ou Vitrine Inicial */}
      {isFiltering ? (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--ink-primary)' }}>
              Registros Localizados ({searchResultPokemons.length})
            </h2>
            <span className="museum-tag">
              Correspondências no fichário
            </span>
          </div>

          {loadingResults && searchResultPokemons.length === 0 ? (
            <p className="handwritten" style={{ fontSize: '20px', padding: '2rem 0', textAlign: 'center' }}>
              Consultando arquivos e gavetas de campo...
            </p>
          ) : searchResultPokemons.length > 0 ? (
            <div className="specimen-grid">
              {searchResultPokemons.map((pokemon, idx) => (
                <SpecimenCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  index={idx}
                  onSelect={onSelectPokemon}
                />
              ))}
            </div>
          ) : (
            <div className="handwritten-note-box" style={{ textAlign: 'center', padding: '2.5rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '20px', color: 'var(--ink-primary)' }}>
                Nenhum espécime encontrado com os critérios informados.
              </p>
              <p style={{ fontSize: '18px', marginTop: '0.4rem', color: 'var(--ink-muted)' }}>
                Tente buscar sem acentos, pelo número ou redefinir os filtros de geração e tipo.
              </p>
            </div>
          )}
        </section>
      ) : (
        /* Vitrine de Amostras Iniciais */
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="rubber-stamp stamp-kanto">Amostragem</span>
                <h2 style={{ fontSize: '1.65rem', margin: 0 }}>Espécimes em Destaque</h2>
              </div>
              <p className="handwritten-caption" style={{ marginTop: '0.2rem' }}>
                Seleção de registros anatômicos clássicos e de expedições recentes
              </p>
            </div>

            <button
              type="button"
              className="vintage-btn"
              onClick={onNavigateToCatalog}
              style={{ padding: '0.6rem 1.15rem' }}
            >
              <IconCatalog size={16} />
              <span>Ver Listagem de Pokémons ({totalSpeciesCount})</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="specimen-grid">
            {samples.map((pokemon, idx) => (
              <SpecimenCard
                key={pokemon.id}
                pokemon={pokemon}
                index={idx}
                onSelect={onSelectPokemon}
              />
            ))}
          </div>

          {/* Banner de Acesso ao Fichário Completo */}
          <div
            className="specimen-card"
            style={{
              marginTop: '3rem',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--paper-warm)',
              border: '2px dashed var(--paper-border)',
            }}
          >
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              Explorar a Listagem de Pokémons Completa ({totalSpeciesCount} Espécimes)
            </h3>
            <p className="handwritten" style={{ fontSize: '1.05rem', marginBottom: '1.25rem', color: 'var(--ink-secondary)' }}>
              Acesse a listagem geral com filtro por todas as gerações (I a IX), tipos elementais e fichas anatômicas.
            </p>
            <button
              type="button"
              className="vintage-btn vintage-btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', gap: '0.6rem' }}
              onClick={onNavigateToCatalog}
            >
              <IconCatalog size={16} />
              <span>Abrir Listagem de Pokémons</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
