import type { User, UsersResponse } from '../types/user'
import { fetchWithTimeout, withTimeout, REQUEST_TIMEOUT_MS } from './fetchWithTimeout'

const BASE_URL = 'https://dummyjson.com/users'

export interface FetchUsersParams {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, string>
  signal?: AbortSignal
}

const TIMEOUT_MSG = 'Превышено время ожидания. Проверьте интернет и повторите.'

async function doFetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
  const { page = 1, limit = 30, sortBy, order, filters = {}, signal } = params
  const skip = (page - 1) * limit

  const url = new URL(BASE_URL)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('skip', String(skip))

  if (sortBy && order) {
    url.searchParams.set('sortBy', sortBy)
    url.searchParams.set('order', order)
  }

  const searchQuery = filters.search?.trim()
  if (searchQuery) {
    const searchUrl = new URL(`${BASE_URL}/search`)
    searchUrl.searchParams.set('q', searchQuery)
    searchUrl.searchParams.set('limit', String(limit))
    searchUrl.searchParams.set('skip', String(skip))
    if (sortBy && order) {
      searchUrl.searchParams.set('sortBy', sortBy)
      searchUrl.searchParams.set('order', order)
    }
    const res = await fetchWithTimeout(searchUrl.toString(), { signal })
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return data
  }

  const filterKeys = Object.keys(filters).filter((k) => k !== 'search' && filters[k])
  if (filterKeys.length > 0) {
    const [key, value] = [filterKeys[0], filters[filterKeys[0]]]
    const filterUrl = new URL(`${BASE_URL}/filter`)
    filterUrl.searchParams.set('key', key)
    filterUrl.searchParams.set('value', value)
    filterUrl.searchParams.set('limit', String(limit))
    filterUrl.searchParams.set('skip', String(skip))
    const res = await fetchWithTimeout(filterUrl.toString(), { signal })
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`)
    const data = await res.json()
    if (sortBy && order && data.users?.length) {
      data.users.sort((a: User, b: User) => {
        const av = a[sortBy as keyof User]
        const bv = b[sortBy as keyof User]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return order === 'asc' ? cmp : -cmp
      })
    }
    return data
  }

  const res = await fetchWithTimeout(url.toString(), { signal })
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data
}

export async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
  return withTimeout(doFetchUsers(params), REQUEST_TIMEOUT_MS, TIMEOUT_MSG)
}

export async function fetchUserById(id: number, signal?: AbortSignal): Promise<User> {
  const res = await fetchWithTimeout(`${BASE_URL}/${id}`, { signal })
  if (!res.ok) {
    throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
