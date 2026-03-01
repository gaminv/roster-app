  import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchUsers } from '../api/users'
import type { User } from '../types/user'

interface UseUsersParams {
  page: number
  limit: number
  sortBy?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, string>
}

interface CacheEntry {
  users: User[]
  total: number
}

function getCacheKey(params: UseUsersParams): string {
  const filters = params.filters ?? {}
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, k) => ({ ...acc, [k]: filters[k] }), {} as Record<string, string>)
  return JSON.stringify({
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy ?? '',
    order: params.order ?? '',
    filters: sortedFilters,
  })
}

const cache = new Map<string, CacheEntry>()
const CACHE_MAX_ENTRIES = 50

const inFlight = new Map<string, Promise<CacheEntry | void>>()

function buildApiParams(params: UseUsersParams): Parameters<typeof fetchUsers>[0] {
  return {
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    order: params.order,
    filters: params.filters ? { ...params.filters } : undefined,
  }
}

export function useUsers(params: UseUsersParams) {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    const cacheKey = getCacheKey(params)

    const hasCached = cache.has(cacheKey)
    if (hasCached) {
      const cached = cache.get(cacheKey)!
      setUsers(cached.users)
      setTotal(cached.total)
      setLoading(false)
      setError(null)
    }

    // Deduplication: reuse in-flight request for same key
    let promise = inFlight.get(cacheKey)
    if (!promise) {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      promise = (async () => {
        try {
          const apiParams = { ...buildApiParams(params), signal: abortRef.current?.signal }
          const data = await fetchUsers(apiParams)
          const entry: CacheEntry = { users: data.users, total: data.total }
          if (cache.size >= CACHE_MAX_ENTRIES) {
            const firstKey = cache.keys().next().value
            if (firstKey) cache.delete(firstKey)
          }
          cache.set(cacheKey, entry)
          return entry
        } finally {
          inFlight.delete(cacheKey)
        }
      })()
      inFlight.set(cacheKey, promise)
    }

    if (!hasCached) setLoading(true)
    setError(null)

    try {
      const entry = await promise
      if (abortRef.current?.signal.aborted) return
      if (!entry) return
      setUsers(entry.users)
      setTotal(entry.total)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
      if (!cache.has(cacheKey)) {
        setUsers((prev) => (prev.length ? prev : []))
        setTotal((prev) => (prev > 0 ? prev : 0))
      }
    } finally {
      if (!abortRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [params.page, params.limit, params.sortBy, params.order, params.filters])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  // Prefetch next page when current is loaded — instant "next" navigation
  useEffect(() => {
    if (loading || error || total === 0) return
    const totalPages = Math.ceil(total / params.limit)
    if (params.page >= totalPages) return
    const nextParams = { ...params, page: params.page + 1 }
    const nextKey = getCacheKey(nextParams)
    if (cache.has(nextKey) || inFlight.has(nextKey)) return
    const controller = new AbortController()
    const apiParams = { ...buildApiParams(nextParams), signal: controller.signal }
    const promise = fetchUsers(apiParams)
      .then((data) => {
        const entry: CacheEntry = { users: data.users, total: data.total }
        if (cache.size >= CACHE_MAX_ENTRIES) {
          const firstKey = cache.keys().next().value
          if (firstKey) cache.delete(firstKey)
        }
        cache.set(nextKey, entry)
        return entry
      })
      .catch(() => {})
    inFlight.set(nextKey, promise)
    promise.finally(() => inFlight.delete(nextKey))
    return () => controller.abort()
  }, [loading, error, total, params.page, params.limit, params.sortBy, params.order, params.filters])

  return { users, total, loading, error, refetch: load }
}

