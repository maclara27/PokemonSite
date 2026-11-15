// Cache Híbrido: Memória (Sessão rápida) + LocalStorage (Persistência com TTL)

const STORAGE_KEY = 'poke_naturalist_cache_v1'
const DEFAULT_TTL_MS = 48 * 60 * 60 * 1000 // 48 horas

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<unknown>>()

  constructor() {
    this.hydrateFromStorage()
  }

  private hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: Record<string, CacheEntry<unknown>> = JSON.parse(raw)
      const now = Date.now()

      for (const [key, entry] of Object.entries(parsed)) {
        if (entry.expiresAt > now) {
          this.memoryCache.set(key, entry)
        }
      }
    } catch (e) {
      console.warn('Falha ao restaurar cache do localStorage:', e)
    }
  }

  private persistToStorage() {
    try {
      const exportObj: Record<string, CacheEntry<unknown>> = {}
      const now = Date.now()
      
      // Salva no máximo os 100 itens mais recentes para não sobrecarregar o storage
      const entries = Array.from(this.memoryCache.entries())
        .filter(([, v]) => v.expiresAt > now)
        .slice(-100)

      for (const [k, v] of entries) {
        exportObj[k] = v
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(exportObj))
    } catch (e) {
      // QuotaExceededError handling
      console.warn('Não foi possível persistir no localStorage (limite de quota):', e)
    }
  }

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    }

    this.memoryCache.set(key, entry as CacheEntry<unknown>)
    this.persistToStorage()
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }
}

export const cache = new CacheManager()

