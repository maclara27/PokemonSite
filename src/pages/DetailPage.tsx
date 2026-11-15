import React, { useEffect, useState } from 'react'
import { MaskingTape } from '../components/ui/MaskingTape'
import { WaxSeal } from '../components/ui/WaxSeal'
import { NaturalistRadar } from '../components/ui/NaturalistRadar'
import { EvolutionView } from '../components/pokemon/EvolutionView'
import {
  IconArrowLeft,
  IconArrowRight,
  IconRuler,
  IconScale,
  IconPin,
  IconCompassStar,
  IconRefresh,
} from '../components/ui/Icons'
import {
  getPokemon,
  getPokemonSpecies,
  getAbility,
  getOfficialArtworkUrl,
  getFallbackSpriteUrl,
  formatPokemonId,
  formatPokemonName,
  getAllPokemonList,
} from '../../src/api/pokeApi'
import {
  getLocalizedFlavorText,
  getLocalizedGenus,
  getLocalizedAbilityEffect,
  getResearcherNote,
  TYPE_TRANSLATIONS,
  HABITAT_TRANSLATIONS,
} from '../api/localization'
import type { Pokemon, PokemonSpecies } from '../api/types'

interface DetailPageProps {
  pokemonId: string | number
  onBackToCatalog: () => void
  onSelectPokemon: (id: number) => void
}

interface EnrichedAbility {
  name: string
  isHidden: boolean
  effect: string
  isFallback: boolean
}

export const DetailPage: React.FC<DetailPageProps> = ({
  pokemonId,
  onBackToCatalog,
  onSelectPokemon,
}) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [abilities, setAbilities] = useState<EnrichedAbility[]>([])
  const [totalCount, setTotalCount] = useState<number>(1025)

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [imgSrc, setImgSrc] = useState<string>('')
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  const numId = typeof pokemonId === 'number' ? pokemonId : parseInt(pokemonId, 10) || 1

  // Descobre total real para navegação circular anterior/próximo
  useEffect(() => {
    getAllPokemonList()
      .then(res => setTotalCount(res.totalCount))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    setIsUsingFallback(false)

    // Tenta carregar Pokémon e Espécie
    Promise.all([
      getPokemon(numId),
      getPokemonSpecies(numId).catch(() => null), // Espécie com fallback seguro
    ])
      .then(async ([pokeData, speciesData]) => {
        if (!isMounted) return

        setPokemon(pokeData)
        setSpecies(speciesData)
        setImgSrc(getOfficialArtworkUrl(pokeData.id))

        // Carrega habilidades de forma resiliente
        if (pokeData.abilities && pokeData.abilities.length > 0) {
          const abilityPromises = pokeData.abilities.map(async (item) => {
            try {
              const detail = await getAbility(item.ability.url)
              const localized = getLocalizedAbilityEffect(item.ability.name, detail.effect_entries, detail.flavor_text_entries)
              return {
                name: item.ability.name,
                isHidden: item.is_hidden,
                effect: localized.text,
                isFallback: localized.isFallback,
              }
            } catch {
              const localized = getLocalizedAbilityEffect(item.ability.name, [], [])
              return {
                name: item.ability.name,
                isHidden: item.is_hidden,
                effect: localized.text,
                isFallback: false,
              }
            }
          })

          const resolvedAbilities = await Promise.all(abilityPromises)
          if (isMounted) setAbilities(resolvedAbilities)
        } else {
          if (isMounted) setAbilities([])
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar detalhes do espécime:', err)
        if (isMounted) {
          setError('Não foi possível localizar as anotações deste espécime nos manuscritos de campo.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [numId])

  const handleImageError = () => {
    if (pokemon && !isUsingFallback) {
      setImgSrc(getFallbackSpriteUrl(pokemon.id))
      setIsUsingFallback(true)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p className="handwritten" style={{ fontSize: '22px' }}>
          Desdobrando mapa e examinando registros anatômicos do espécime...
        </p>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="handwritten-note-box" style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '2rem 0' }}>
        <p style={{ fontSize: '20px', color: 'var(--stamp-red)' }}>
          {error || 'Registro não localizado.'}
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="vintage-btn"
            onClick={onBackToCatalog}
          >
            <IconArrowLeft size={13} />
            <span>Retornar ao Fichário</span>
          </button>
          <button
            type="button"
            className="vintage-btn vintage-btn-primary"
            onClick={() => onSelectPokemon(numId)}
          >
            <IconRefresh size={13} />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    )
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal'
  const primaryColorVar = TYPE_TRANSLATIONS[primaryType]?.colorVar || 'var(--stamp-red)'

  const genus = species ? getLocalizedGenus(species.genera) : 'Espécime Catalogado'
  const habitat = species?.habitat?.name
    ? HABITAT_TRANSLATIONS[species.habitat.name] || species.habitat.name
    : 'Diversos Biomas'

  const lore = species
    ? getLocalizedFlavorText(species.flavor_text_entries)
    : { text: 'Crônica de campo em observação.', isFallback: true }

  const noteInfo = getResearcherNote(pokemon.id)

  const heightMeters = (pokemon.height / 10).toFixed(1)
  const weightKg = (pokemon.weight / 10).toFixed(1)

  // Mapeia stats para a Rosa dos Ventos
  const statsMap = {
    hp: pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 50,
    attack: pokemon.stats.find((s) => s.stat.name === 'attack')?.base_stat || 50,
    defense: pokemon.stats.find((s) => s.stat.name === 'defense')?.base_stat || 50,
    specialAttack: pokemon.stats.find((s) => s.stat.name === 'special-attack')?.base_stat || 50,
    specialDefense: pokemon.stats.find((s) => s.stat.name === 'special-defense')?.base_stat || 50,
    speed: pokemon.stats.find((s) => s.stat.name === 'speed')?.base_stat || 50,
  }

  const prevId = pokemon.id > 1 ? pokemon.id - 1 : totalCount
  const nextId = pokemon.id < totalCount ? pokemon.id + 1 : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Barra de Navegação Rápida entre Espécimes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="vintage-btn"
          onClick={onBackToCatalog}
          style={{ padding: '0.5rem 1rem' }}
        >
          <IconArrowLeft size={13} />
          <span>Voltar para a Listagem</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="vintage-btn"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => onSelectPokemon(prevId)}
            title="Espécime anterior"
          >
            <IconArrowLeft size={11} />
            <span>{formatPokemonId(prevId)}</span>
          </button>
          <button
            type="button"
            className="vintage-btn"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => onSelectPokemon(nextId)}
            title="Próximo espécime"
          >
            <span>{formatPokemonId(nextId)}</span>
            <IconArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Página de Diário Duplo (Desktop) / Vertical (Mobile 360px) */}
      <div
        className="specimen-card"
        style={{
          padding: '1.75rem 1.25rem',
          backgroundColor: 'var(--paper-card)',
          borderRadius: '4px',
          boxShadow: 'var(--shadow-paper-lifted)',
        }}
      >
        <MaskingTape position="top-left" style={{ width: '100px' }} />
        <MaskingTape position="top-right" style={{ width: '100px' }} />

        {/* Topo do Registro Oficial */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '2px solid var(--paper-border)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span className="specimen-number" style={{ fontSize: '1.35rem' }}>
                {formatPokemonId(pokemon.id)}
              </span>
              <span className="museum-tag" style={{ fontSize: '1rem' }}>
                • {genus}
              </span>
            </div>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--ink-primary)' }}>
              {formatPokemonName(pokemon.name)}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {pokemon.types.map((t) => (
              <WaxSeal key={t.slot} type={t.type.name} />
            ))}
          </div>
        </div>

        {/* Layout de Duas Colunas do Caderno */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* COLUNA ESQUERDA: Prancha Anatômica, Biometria e Notas do Pesquisador */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Prancha Botânica com Desenho Litográfico */}
            <div
              className="naturalist-illustration-container botanical-frame"
              style={{
                height: '300px',
                position: 'relative',
                backgroundColor: 'rgba(255,255,255,0.45)',
              }}
            >
              <div
                className="watercolor-wash"
                style={{ backgroundColor: primaryColorVar, width: '85%', height: '85%' }}
                aria-hidden="true"
              />
              <img
                src={imgSrc}
                alt={`Desenho anatômico de ${formatPokemonName(pokemon.name)}`}
                className={isUsingFallback ? 'fallback-sprite' : 'naturalist-artwork sketch-reveal'}
                onError={handleImageError}
                style={{ maxHeight: isUsingFallback ? '160px' : '265px', objectFit: 'contain' }}
              />
              <span
                className="handwritten"
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '12px',
                  fontSize: '18px',
                  color: 'var(--ink-secondary)',
                }}
              >
                fig. {pokemon.id} — Espécime vivo
              </span>
            </div>

            {/* Escala e Biometria de Campo */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                backgroundColor: 'var(--paper-warm)',
                padding: '0.85rem 1.1rem',
                border: '1px solid var(--paper-border)',
                borderRadius: '2px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IconRuler size={14} style={{ color: 'var(--ink-secondary)' }} />
                  <span className="museum-tag">Altura Estimada</span>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                  {heightMeters} m
                </p>
                <span className="handwritten-caption">Fita métrica de campo</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IconScale size={14} style={{ color: 'var(--ink-secondary)' }} />
                  <span className="museum-tag">Massa Corporal</span>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                  {weightKg} kg
                </p>
                <span className="handwritten-caption">Balança de expedição</span>
              </div>
            </div>

            {/* Bioma e Habitat */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconPin size={16} style={{ color: 'var(--moss-accent)' }} />
              <span className="museum-tag">Habitat Primário:</span>
              <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--moss-accent)' }}>
                {habitat}
              </strong>
            </div>

            {/* SEÇÃO PRINCIPAL: DESCRIÇÃO E NOTAS DO POKÉMON */}
            <div
              className="handwritten-note-box"
              style={{
                backgroundColor: 'rgba(238, 226, 204, 0.85)',
                borderLeft: '4px solid var(--stamp-red)',
                padding: '1.15rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span className="rubber-stamp stamp-danger" style={{ fontSize: '0.72rem' }}>
                  Descrição & Curiosidades
                </span>
                <span className="museum-tag">Registro em Português</span>
              </div>

              <p style={{ fontSize: '1.05rem', color: 'var(--ink-handwritten)', lineHeight: '1.6' }}>
                "{noteInfo.text}"
              </p>
            </div>

            {/* Crônica Oficial de Campo */}
            {lore.text && lore.text !== noteInfo.text && (
              <div style={{ borderTop: '1px dashed var(--paper-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                  <span className="museum-tag">Crônica Oficial da Espécie:</span>
                </div>
                <p className="lore-paragraph">
                  {lore.text}
                </p>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: Rosa dos Ventos dos Stats, Habilidades e Linhagem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. VISUALIZAÇÃO CRIATIVA DE STATS: Rosa dos Ventos / Astrolábio */}
            <section
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid var(--paper-border)',
                padding: '1.25rem',
                borderRadius: '3px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="rubber-stamp stamp-official" style={{ fontSize: '0.68rem' }}>
                  Análise Anatômica
                </span>
                <span className="museum-tag">Balanço de Combate</span>
              </div>

              <NaturalistRadar stats={statsMap} accentColor={primaryColorVar} />
            </section>

            {/* 2. HABILIDADES COM EFEITO E DESTAQUE PARA HABILIDADE OCULTA */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="rubber-stamp stamp-kanto">Aptidões</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Habilidades Observadas</h3>
              </div>

              {abilities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {abilities.map((ab, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: ab.isHidden ? 'rgba(158, 46, 30, 0.08)' : 'var(--paper-warm)',
                        border: ab.isHidden ? '1px dashed var(--stamp-red)' : '1px solid var(--paper-border)',
                        borderRadius: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
                          {formatPokemonName(ab.name)}
                        </strong>

                        {ab.isHidden ? (
                          <span className="rubber-stamp stamp-danger" style={{ fontSize: '0.65rem' }}>
                            <IconCompassStar size={9} />
                            <span>Habilidade Oculta / Rara</span>
                          </span>
                        ) : (
                          <span className="museum-tag">Padrão da Espécie</span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.95rem', color: 'var(--ink-secondary)', lineHeight: '1.45' }}>
                        {ab.effect}
                      </p>

                      {ab.isFallback && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontStyle: 'italic', display: 'block', marginTop: '0.2rem' }}>
                          [tradução de campo pendente]
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="handwritten-note-box" style={{ padding: '0.75rem' }}>
                  <p style={{ fontSize: '18px', color: 'var(--ink-muted)' }}>
                    Nenhuma habilidade especial documentada para este espécime.
                  </p>
                </div>
              )}
            </section>

            {/* 3. CADEIA EVOLUTIVA ESBOÇADA (Suporta ramificações como Eevee) */}
            <section style={{ borderTop: '1px dashed var(--paper-border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="rubber-stamp stamp-official">Linhagem</span>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Metamorfoses & Evoluções</h3>
              </div>

              {species?.evolution_chain?.url ? (
                <EvolutionView
                  chainUrl={species.evolution_chain.url}
                  currentId={pokemon.id}
                  onSelectPokemon={onSelectPokemon}
                />
              ) : (
                <div className="handwritten-note-box" style={{ padding: '0.75rem' }}>
                  <p style={{ fontSize: '18px', color: 'var(--ink-muted)' }}>
                    Linhagem evolutiva não disponível nos manuscritos.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
