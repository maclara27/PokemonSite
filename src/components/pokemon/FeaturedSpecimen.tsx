import React, { useState, useEffect } from 'react'
import { MaskingTape } from '../ui/MaskingTape'
import { WaxSeal } from '../ui/WaxSeal'
import { IconRefresh, IconMicroscope, IconArrowRight } from '../ui/Icons'
import {
  getOfficialArtworkUrl,
  getFallbackSpriteUrl,
  formatPokemonId,
  formatPokemonName,
} from '../../api/pokeApi'
import { getResearcherNote, TYPE_TRANSLATIONS } from '../../api/localization'
import type { Pokemon } from '../../api/types'

interface FeaturedSpecimenProps {
  pokemon: Pokemon | null
  loading: boolean
  onSelect: (id: number) => void
  onReroll: () => void
}

export const FeaturedSpecimen: React.FC<FeaturedSpecimenProps> = ({
  pokemon,
  loading,
  onSelect,
  onReroll,
}) => {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false)

  useEffect(() => {
    if (pokemon) {
      setImgSrc(getOfficialArtworkUrl(pokemon.id))
      setIsUsingFallback(false)
    }
  }, [pokemon])

  const handleImageError = () => {
    if (pokemon && !isUsingFallback) {
      setImgSrc(getFallbackSpriteUrl(pokemon.id))
      setIsUsingFallback(true)
    }
  }

  if (loading || !pokemon) {
    return (
      <section
        className="specimen-card"
        style={{
          padding: '2.5rem 1.5rem',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <p className="handwritten" style={{ fontSize: '22px', textAlign: 'center' }}>
          Consultando anotações de campo nos arquivos...
        </p>
      </section>
    )
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal'
  const primaryColorVar = TYPE_TRANSLATIONS[primaryType]?.colorVar || 'var(--ink-secondary)'
  const noteInfo = getResearcherNote(pokemon.id)

  const heightMeters = (pokemon.height / 10).toFixed(1)
  const weightKg = (pokemon.weight / 10).toFixed(1)

  return (
    <section
      className="specimen-card"
      style={{
        padding: '1.75rem',
        marginBottom: '2.5rem',
        position: 'relative',
        background: 'linear-gradient(135deg, var(--paper-card) 0%, var(--paper-warm) 100%)',
      }}
    >
      <MaskingTape position="center" style={{ width: '120px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="rubber-stamp stamp-danger" style={{ fontSize: '0.75rem' }}>
            Espécime em Observação de Campo
          </span>
          <span className="specimen-number" style={{ fontSize: '1.1rem' }}>
            {formatPokemonId(pokemon.id)}
          </span>
        </div>

        <button
          type="button"
          onClick={onReroll}
          className="vintage-btn"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          title="Sortear outro espécime para observação"
        >
          <IconRefresh size={14} />
          <span>Sortear Outro Espécime</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', alignItems: 'center' }}>
        {/* Lado Esquerdo: Desenho Botânico com Moldura */}
        <div
          className="naturalist-illustration-container botanical-frame"
          style={{
            height: '270px',
            borderRadius: '2px',
            backgroundColor: 'rgba(255,255,255,0.45)',
          }}
        >
          <div
            className="watercolor-wash"
            style={{ backgroundColor: primaryColorVar, width: '90%', height: '90%' }}
            aria-hidden="true"
          />
          <img
            src={imgSrc}
            alt={`Desenho botânico de ${formatPokemonName(pokemon.name)}`}
            className={isUsingFallback ? 'fallback-sprite' : 'naturalist-artwork sketch-reveal'}
            onError={handleImageError}
            style={{ maxHeight: isUsingFallback ? '140px' : '240px', objectFit: 'contain' }}
          />
        </div>

        {/* Lado Direito: Registro Descritivo e Notas do Pesquisador */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <h2 style={{ fontSize: '2.1rem', marginBottom: '0.35rem', color: 'var(--ink-primary)' }}>
              {formatPokemonName(pokemon.name)}
            </h2>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {pokemon.types.map((t) => (
                <WaxSeal key={t.slot} type={t.type.name} />
              ))}
            </div>
          </div>

          {/* Dados Físicos de Campo */}
          <div style={{ display: 'flex', gap: '1.75rem', borderTop: '1px dashed var(--paper-border)', borderBottom: '1px dashed var(--paper-border)', padding: '0.6rem 0' }}>
            <div>
              <span className="museum-tag">Altura Estimada</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink-secondary)' }}>
                {heightMeters} m
              </p>
            </div>
            <div>
              <span className="museum-tag">Massa Corporal</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink-secondary)' }}>
                {weightKg} kg
              </p>
            </div>
          </div>

          {/* Descrição e Curiosidades em Português */}
          <div className="handwritten-note-box">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--stamp-red)', fontFamily: 'var(--font-serif)' }}>
              Descrição & Curiosidades:
            </span>
            <p style={{ marginTop: '0.3rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
              "{noteInfo.text}"
            </p>
          </div>

          {/* Botão de Ação para Detalhes */}
          <div style={{ marginTop: '0.4rem' }}>
            <button
              type="button"
              className="vintage-btn vintage-btn-primary"
              style={{ width: '100%', padding: '0.75rem 1.25rem', gap: '0.6rem' }}
              onClick={() => onSelect(pokemon.id)}
            >
              <IconMicroscope size={17} />
              <span>Examinar Registro Completo & Atributos</span>
              <IconArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
