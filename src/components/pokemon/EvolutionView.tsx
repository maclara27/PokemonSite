import React, { useEffect, useState } from 'react'
import {
  getEvolutionChain,
  getOfficialArtworkUrl,
  getFallbackSpriteUrl,
  formatPokemonId,
  formatPokemonName,
} from '../../api/pokeApi'
import { IconArrowRight } from '../ui/Icons'

interface EvolutionNode {
  id: number
  name: string
  triggerText: string
  evolvesTo: EvolutionNode[]
}

interface EvolutionViewProps {
  chainUrl: string
  currentId: number
  onSelectPokemon: (id: number) => void
}

function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon-species\/(\d+)\/?$/)
  if (match) return parseInt(match[1], 10)
  const fallback = url.match(/\/(\d+)\/?$/)
  return fallback ? parseInt(fallback[1], 10) : 1
}

function parseEvolutionDetails(details: any[]): string {
  if (!details || details.length === 0) return 'Evolução'
  const d = details[0]

  if (d.min_level) return `Nível ${d.min_level}`
  if (d.item) return `${formatPokemonName(d.item.name)}`
  if (d.trigger?.name === 'trade') return 'Por Troca'
  if (d.min_happiness) return 'Por Amizade'
  if (d.time_of_day) return `Dia/Noite (${d.time_of_day})`
  if (d.known_move) return `Com ${formatPokemonName(d.known_move.name)}`
  return 'Evolução Especial'
}

function parseChainNode(node: any): EvolutionNode {
  const id = extractIdFromUrl(node.species.url)
  const name = node.species.name
  const triggerText = parseEvolutionDetails(node.evolution_details)
  const evolvesTo = (node.evolves_to || []).map(parseChainNode)

  return { id, name, triggerText, evolvesTo }
}

const EvolutionCard: React.FC<{
  node: EvolutionNode
  isCurrent: boolean
  onSelect: (id: number) => void
}> = ({ node, isCurrent, onSelect }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => getOfficialArtworkUrl(node.id))
  const [isFallback, setIsFallback] = useState<boolean>(false)

  return (
    <div
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(node.id)
        }
      }}
      tabIndex={0}
      role="button"
      style={{
        cursor: 'pointer',
        padding: '0.65rem 0.75rem',
        background: isCurrent ? 'rgba(158, 46, 30, 0.12)' : 'var(--paper-card)',
        border: isCurrent ? '2px solid var(--stamp-red)' : '1px solid var(--paper-border)',
        borderRadius: '3px',
        textAlign: 'center',
        minWidth: '95px',
        maxWidth: '120px',
        boxShadow: isCurrent ? 'var(--shadow-paper-lifted)' : 'var(--shadow-paper-flat)',
        flexShrink: 0,
      }}
      title={isCurrent ? 'Espécime em visualização' : `Examinar ${formatPokemonName(node.name)}`}
      aria-label={`${formatPokemonName(node.name)} ${isCurrent ? '(atual)' : ''}`}
    >
      <img
        src={imgSrc}
        alt={node.name}
        loading="lazy"
        onError={() => {
          if (!isFallback) {
            setImgSrc(getFallbackSpriteUrl(node.id))
            setIsFallback(true)
          }
        }}
        style={{
          width: '56px',
          height: '56px',
          objectFit: 'contain',
          margin: '0 auto',
          mixBlendMode: 'multiply',
          imageRendering: isFallback ? 'pixelated' : 'auto',
        }}
      />
      <span className="specimen-number" style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
        {formatPokemonId(node.id)}
      </span>
      <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '0.85rem', color: 'var(--ink-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {formatPokemonName(node.name)}
      </strong>
    </div>
  )
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  chainUrl,
  currentId,
  onSelectPokemon,
}) => {
  const [rootNode, setRootNode] = useState<EvolutionNode | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!chainUrl) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(false)

    getEvolutionChain(chainUrl)
      .then(data => {
        if (!isMounted) return
        if (data && data.chain) {
          setRootNode(parseChainNode(data.chain))
        }
      })
      .catch(err => {
        console.error('Erro ao carregar cadeia evolutiva:', err)
        if (isMounted) setError(true)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [chainUrl])

  if (loading) {
    return (
      <p className="handwritten" style={{ fontSize: '18px', color: 'var(--ink-muted)' }}>
        Rastreando linhagem ancestral nos manuscritos...
      </p>
    )
  }

  if (error || !rootNode || rootNode.evolvesTo.length === 0) {
    return (
      <div className="handwritten-note-box" style={{ padding: '0.75rem 1rem' }}>
        <p style={{ fontSize: '18px', color: 'var(--ink-secondary)' }}>
          Espécime de estágio único catalogado; não foram registradas ramificações evolutivas nesta espécie.
        </p>
      </div>
    )
  }

  // Tratamento especial para linhagens ramificadas (como Eevee, com 8 ramificações)
  const isBranching = rootNode.evolvesTo.length > 2

  return (
    <div style={{ overflowX: 'auto', padding: '0.5rem 0 1rem' }}>
      {isBranching ? (
        /* Layout em Grade para Linhagens Ramificadas (Ex: Eevee) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <EvolutionCard
              node={rootNode}
              isCurrent={rootNode.id === currentId}
              onSelect={onSelectPokemon}
            />
            <div>
              <span className="rubber-stamp stamp-official" style={{ fontSize: '0.65rem' }}>
                Linhagem com Múltiplas Mutações ({rootNode.evolvesTo.length} Ramificações)
              </span>
              <p className="handwritten" style={{ fontSize: '18px', color: 'var(--ink-secondary)', marginTop: '0.2rem' }}>
                Reage a diferentes estímulos de pedras elementais, horário e ambiente.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '0.85rem',
              borderTop: '1px dashed var(--paper-border)',
              paddingTop: '1rem',
            }}
          >
            {rootNode.evolvesTo.map((child) => (
              <div
                key={child.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '3px',
                }}
              >
                <div style={{ textAlign: 'center', minWidth: '45px' }}>
                  <IconArrowRight size={12} style={{ color: 'var(--stamp-red)' }} />
                  <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--ink-muted)', fontFamily: 'var(--font-serif)' }}>
                    {child.triggerText}
                  </span>
                </div>
                <EvolutionCard
                  node={child}
                  isCurrent={child.id === currentId}
                  onSelect={onSelectPokemon}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Layout Linear / Padrão */
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          <EvolutionCard
            node={rootNode}
            isCurrent={rootNode.id === currentId}
            onSelect={onSelectPokemon}
          />

          {rootNode.evolvesTo.map((stage2) => (
            <React.Fragment key={stage2.id}>
              <div style={{ textAlign: 'center', padding: '0 0.25rem' }}>
                <span className="handwritten" style={{ fontSize: '16px', color: 'var(--stamp-red)', display: 'block' }}>
                  {stage2.triggerText}
                </span>
                <IconArrowRight size={16} style={{ color: 'var(--ink-secondary)' }} />
              </div>

              <EvolutionCard
                node={stage2}
                isCurrent={stage2.id === currentId}
                onSelect={onSelectPokemon}
              />

              {stage2.evolvesTo.map((stage3) => (
                <React.Fragment key={stage3.id}>
                  <div style={{ textAlign: 'center', padding: '0 0.25rem' }}>
                    <span className="handwritten" style={{ fontSize: '16px', color: 'var(--stamp-red)', display: 'block' }}>
                      {stage3.triggerText}
                    </span>
                    <IconArrowRight size={16} style={{ color: 'var(--ink-secondary)' }} />
                  </div>

                  <EvolutionCard
                    node={stage3}
                    isCurrent={stage3.id === currentId}
                    onSelect={onSelectPokemon}
                  />
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
