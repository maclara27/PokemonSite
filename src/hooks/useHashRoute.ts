import { useState, useEffect } from 'react'

export interface RouteState {
  page: 'home' | 'catalog' | 'detail'
  pokemonId?: string | number
  rawHash: string
}

function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, '').trim()

  if (!clean || clean === '') {
    return { page: 'home', rawHash: hash }
  }

  if (clean === 'catalogo') {
    return { page: 'catalog', rawHash: hash }
  }

  const pokemonMatch = clean.match(/^pokemon\/([^/?#]+)/)
  if (pokemonMatch) {
    return {
      page: 'detail',
      pokemonId: pokemonMatch[1],
      rawHash: hash,
    }
  }

  return { page: 'home', rawHash: hash }
}

export function useHashRoute(): RouteState & { navigate: (path: string) => void } {
  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (path: string) => {
    const target = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`
    window.location.hash = target
  }

  return { ...route, navigate }
}

