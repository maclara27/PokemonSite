import React, { useState } from 'react'
import { MaskingTape } from '../ui/MaskingTape'
import { WaxSeal } from '../ui/WaxSeal'
import { IconArrowRight } from '../ui/Icons'
import {
  getOfficialArtworkUrl,
  getFallbackSpriteUrl,
  formatPokemonId,
  formatPokemonName,
} from '../../api/pokeApi'
import { getResearcherNote, TYPE_TRANSLATIONS } from '../../api/localization'
import type { Pokemon } from '../../api/types'

interface SpecimenCardProps {
  pokemon: Pokemon
  index: number
  onSelect: (id: number) => void
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  pokemon,
  index,
  onSelect,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => getOfficialArtworkUrl(pokemon.id))
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  // Classes de rotação aplicadas exclusivamente à camada ::before de fundo
  const tiltClasses = [
    'tilt-left-sm',
    'tilt-right-sm',
    'tilt-slight',
    'tilt-right-md',
    'tilt-left-md',
  ]
  const tiltClass = tiltClasses[index % tiltClasses.length]

  const primaryType = pokemon.types[0]?.type.name || 'normal'
  const primaryColorVar = TYPE_TRANSLATIONS[primaryType]?.colorVar || 'var(--ink-secondary)'
  const noteInfo = getResearcherNote(pokemon.id)

  const handleImageError = () => {
    if (!isUsingFallback) {
      setImgSrc(getFallbackSpriteUrl(pokemon.id))
      setIsUsingFallback(true)
    }
  }

  return (
    <article
      className={`specimen-card ${tiltClass}`}
      style={{
        padding: '1.25rem 1rem 1rem',
        borderRadius: '3px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onSelect(pokemon.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(pokemon.id)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Registro ${formatPokemonId(pokemon.id)}: ${formatPokemonName(pokemon.name)}`}
    >
      {/* Fita adesiva segurando a folha */}
      <MaskingTape position={index % 2 === 0 ? 'top-left' : 'top-right'} />

      {/* Cabeçalho da Ficha */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
        <span className="specimen-number" style={{ fontSize: '0.95rem' }}>
          {formatPokemonId(pokemon.id)}
        </span>
        <span className="rubber-stamp stamp-official" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
          Registrado
        </span>
      </div>

      {/* Ilustração Botânica */}
      <div className="naturalist-illustration-container botanical-frame" style={{ height: '170px', margin: '0.25rem 0 0.85rem' }}>
        <div
          className="watercolor-wash"
          style={{ backgroundColor: primaryColorVar }}
          aria-hidden="true"
        />
        <img
          src={imgSrc}
          alt={`Ilustração botânica de ${formatPokemonName(pokemon.name)}`}
          loading="lazy"
          className={isUsingFallback ? 'fallback-sprite' : 'naturalist-artwork'}
          onError={handleImageError}
          style={{ maxHeight: isUsingFallback ? '100px' : '145px', objectFit: 'contain' }}
        />
      </div>

      {/* Nome e Tipos */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: 'var(--ink-primary)' }}>
        {formatPokemonName(pokemon.name)}
      </h3>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {pokemon.types.map((t) => (
          <WaxSeal key={t.slot} type={t.type.name} size="sm" />
        ))}
      </div>

      {/* Descrição e Curiosidade do Pokémon */}
      <div style={{ marginTop: 'auto', minHeight: '50px' }}>
        <p
          className="handwritten"
          style={{
            fontSize: '0.98rem',
            color: 'var(--ink-handwritten)',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          "{noteInfo.text}"
        </p>
      </div>

      {/* Link de Exame */}
      <div style={{ borderTop: '1px dashed var(--paper-border)', marginTop: '0.8rem', paddingTop: '0.55rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--stamp-red)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>Examinar Anotações</span>
          <IconArrowRight size={13} />
        </span>
      </div>
    </article>
  )
}
