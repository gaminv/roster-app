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

const TIMEOUT_MSG =
  'Превышено время ожидания. При медленном доступе к API включите VPN. Данные из кэша сохранены.'

const MAX_USERS_FOR_CLIENT_FILTER = 200

function filterUsersClientSide(
  users: User[],
  filters: Record<string, string>,
  sortBy?: string,
  order?: 'asc' | 'desc'
): User[] {
  let list = [...users]
  const ageMin = filters.ageMin?.trim()
  const ageMax = filters.ageMax?.trim()
  const phone = filters.phone?.trim()

  if (ageMin) {
    const min = parseInt(ageMin, 10)
    if (!Number.isNaN(min)) list = list.filter((u) => u.age >= min)
  }
  if (ageMax) {
    const max = parseInt(ageMax, 10)
    if (!Number.isNaN(max)) list = list.filter((u) => u.age <= max)
  }
  if (phone) {
    const lower = phone.toLowerCase()
    list = list.filter((u) => (u.phone ?? '').toLowerCase().includes(lower))
  }

  if (sortBy && order && list.length) {
    list.sort((a, b) => {
      const av = a[sortBy as keyof User]
      const bv = b[sortBy as keyof User]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return order === 'asc' ? cmp : -cmp
    })
  }
  return list
}

async function fetchAllUsers(signal?: AbortSignal): Promise<User[]> {
  const url = new URL(BASE_URL)
  url.searchParams.set('limit', String(MAX_USERS_FOR_CLIENT_FILTER))
  url.searchParams.set('skip', '0')
  const res = await fetchWithTimeout(url.toString(), { signal })
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data.users ?? []
}

async function doFetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
  const { page = 1, limit = 30, sortBy, order, filters = {}, signal } = params
  const skip = (page - 1) * limit

  const searchQuery = filters.search?.trim()
  const ageMin = filters.ageMin?.trim()
  const ageMax = filters.ageMax?.trim()
  const phoneFilter = filters.phone?.trim()
  const genderFilter = filters.gender?.trim()

  const needsClientFilter = ageMin || ageMax || phoneFilter

  if (searchQuery) {
    const url = new URL(BASE_URL)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('skip', String(skip))
    if (sortBy && order) {
      url.searchParams.set('sortBy', sortBy)
      url.searchParams.set('order', order)
    }
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

  if (needsClientFilter) {
    const all = await fetchAllUsers(signal)
    const filtered = filterUsersClientSide(all, filters, sortBy, order)
    const total = filtered.length
    const users = filtered.slice(skip, skip + limit)
    return { users, total, skip, limit }
  }

  if (genderFilter) {
    const filterUrl = new URL(`${BASE_URL}/filter`)
    filterUrl.searchParams.set('key', 'gender')
    filterUrl.searchParams.set('value', genderFilter)
    filterUrl.searchParams.set('limit', String(limit))
    filterUrl.searchParams.set('skip', String(skip))
    if (sortBy && order) {
      filterUrl.searchParams.set('sortBy', sortBy)
      filterUrl.searchParams.set('order', order)
    }
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

  const url = new URL(BASE_URL)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('skip', String(skip))
  if (sortBy && order) {
    url.searchParams.set('sortBy', sortBy)
    url.searchParams.set('order', order)
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
