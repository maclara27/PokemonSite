import { cache } from './cacheManager'
import type { Pokemon, PokemonSpecies, AbilityDetail, PokemonListItem } from './types'

const BASE_URL = 'https://pokeapi.co/api/v2'

export interface GenerationRange {
  id: string
  roman: string
  label: string
  start: number
  end: number
}

export const GENERATIONS: GenerationRange[] = [
  { id: '1', roman: 'Gen I', label: 'Gen I • Kanto (1-151)', start: 1, end: 151 },
  { id: '2', roman: 'Gen II', label: 'Gen II • Johto (152-251)', start: 152, end: 251 },
  { id: '3', roman: 'Gen III', label: 'Gen III • Hoenn (252-386)', start: 252, end: 386 },
  { id: '4', roman: 'Gen IV', label: 'Gen IV • Sinnoh (387-493)', start: 387, end: 493 },
  { id: '5', roman: 'Gen V', label: 'Gen V • Unova (494-649)', start: 494, end: 649 },
  { id: '6', roman: 'Gen VI', label: 'Gen VI • Kalos (650-721)', start: 650, end: 721 },
  { id: '7', roman: 'Gen VII', label: 'Gen VII • Alola (722-809)', start: 722, end: 809 },
  { id: '8', roman: 'Gen VIII', label: 'Gen VIII • Galar/Hisui (810-905)', start: 810, end: 905 },
  { id: '9', roman: 'Gen IX', label: 'Gen IX • Paldea (906-1025)', start: 906, end: 1025 },
]

export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function getFallbackSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export function formatPokemonId(id: number): string {
  return `Nº ${String(id).padStart(3, '0')}`
}

export function formatPokemonName(name: string): string {
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
}

// Normaliza texto para busca insensível a acentos e pontuações
export function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

// Extrai ID numérico do endpoint de espécie
function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon-species\/(\d+)\/?$/)
  if (match) return parseInt(match[1], 10)
  const matchFallback = url.match(/\/(\d+)\/?$/)
  return matchFallback ? parseInt(matchFallback[1], 10) : 1
}

// Fetch com cache duplo em memória e localStorage
async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get<T>(url)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Falha na requisição para ${url}: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as T
  cache.set(url, data)
  return data
}

// 1. Obter Pokémon por ID ou Nome (trata formas alternativas)
export async function getPokemon(idOrName: string | number): Promise<Pokemon> {
  const param = String(idOrName).toLowerCase().trim()
  const url = `${BASE_URL}/pokemon/${param}`
  return fetchWithCache<Pokemon>(url)
}

// 2. Obter Espécie por ID ou Nome
export async function getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
  const param = String(idOrName).toLowerCase().trim()
  const url = `${BASE_URL}/pokemon-species/${param}`
  return fetchWithCache<PokemonSpecies>(url)
}

// 3. Obter Detalhes da Habilidade
export async function getAbility(idOrNameOrUrl: string | number): Promise<AbilityDetail> {
  const url = typeof idOrNameOrUrl === 'string' && idOrNameOrUrl.startsWith('http')
    ? idOrNameOrUrl
    : `${BASE_URL}/ability/${String(idOrNameOrUrl).toLowerCase().trim()}`
  return fetchWithCache<AbilityDetail>(url)
}

// 4. Obter Cadeia de Evolução
export async function getEvolutionChain(url: string): Promise<any> {
  return fetchWithCache<any>(url)
}

// 5. Descobrir dinamicamente e listar TODOS os Pokémon existentes
export async function getAllPokemonList(): Promise<{ totalCount: number; items: PokemonListItem[] }> {
  const cacheKey = 'all_pokemon_species_list_v2'
  const cached = cache.get<{ totalCount: number; items: PokemonListItem[] }>(cacheKey)
  if (cached) return cached

  // Busca até 2000 espécies para descobrir o total real da PokéAPI
  const url = `${BASE_URL}/pokemon-species?limit=2000`
  const res = await fetchWithCache<{ count: number; results: { name: string; url: string }[] }>(url)

  // Filtra espécies principais (exclui variantes especiais com IDs > 10000)
  const items: PokemonListItem[] = res.results
    .map(item => {
      const id = extractIdFromUrl(item.url)
      return { id, name: item.name, url: item.url }
    })
    .filter(item => item.id <= 10000)
    .sort((a, b) => a.id - b.id)

  const payload = {
    totalCount: items.length,
    items,
  }

  cache.set(cacheKey, payload)
  return payload
}
