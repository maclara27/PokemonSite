export interface NamedAPIResource {
  name: string
  url: string
}

export interface PokemonType {
  slot: number
  type: NamedAPIResource
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface PokemonSprites {
  front_default: string | null
  other?: {
    'official-artwork'?: {
      front_default: string | null
    }
  }
}

export interface Pokemon {
  id: number
  name: string
  height: number // em decímetros (ex: 7 = 0.7m)
  weight: number // em hectogramas (ex: 69 = 6.9kg)
  types: PokemonType[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  sprites: PokemonSprites
}

export interface FlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
  version?: NamedAPIResource
}

export interface GenusEntry {
  genus: string
  language: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  flavor_text_entries: FlavorTextEntry[]
  genera: GenusEntry[]
  habitat: NamedAPIResource | null
  evolution_chain: {
    url: string
  }
}

export interface AbilityEffectEntry {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface AbilityFlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
}

export interface AbilityDetail {
  id: number
  name: string
  effect_entries: AbilityEffectEntry[]
  flavor_text_entries: AbilityFlavorTextEntry[]
}

export interface EvolutionLink {
  speciesName: string
  id: number
  details?: string
  evolvesTo: EvolutionLink[]
}

export interface PokemonListItem {
  id: number
  name: string
  url: string
}

export interface ProcessedSpecimen {
  id: number
  name: string
  formattedName: string
  artworkUrl: string
  miniSpriteUrl: string | null
  heightMeters: number
  weightKg: number
  types: string[]
  stats: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
  abilities: {
    name: string
    isHidden: boolean
    url: string
    description?: string
  }[]
  genus: string
  habitat: string
  researcherNote: string
  pokeApiLore: {
    text: string
    isFallback: boolean
  }
}

