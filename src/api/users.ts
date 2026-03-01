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

/** Normalize phone for comparison: remove spaces, dashes, parentheses; lowercase */
function normalizePhone(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s\-()]/g, '')
}

function filterUsersClientSide(
  users: User[],
  filters: Record<string, string>,
  sortBy?: string,
  order?: 'asc' | 'desc'
): User[] {
  let list = [...users]
  const searchQuery = filters.search?.trim()
  const ageMin = filters.ageMin?.trim()
  const ageMax = filters.ageMax?.trim()
  const genderFilter = filters.gender?.trim()
  const phoneFilter = filters.phone?.trim()

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    list = list.filter(
      (u) =>
        (u.firstName ?? '').toLowerCase().includes(q) ||
        (u.lastName ?? '').toLowerCase().includes(q) ||
        (u.maidenName ?? '').toLowerCase().includes(q)
    )
  }
  if (ageMin) {
    const min = parseInt(ageMin, 10)
    if (!Number.isNaN(min)) list = list.filter((u) => u.age >= min)
  }
  if (ageMax) {
    const max = parseInt(ageMax, 10)
    if (!Number.isNaN(max)) list = list.filter((u) => u.age <= max)
  }
  if (genderFilter) {
    list = list.filter((u) => (u.gender ?? '').toLowerCase() === genderFilter.toLowerCase())
  }
  if (phoneFilter) {
    const normalized = normalizePhone(phoneFilter)
    list = list.filter((u) => normalizePhone(u.phone ?? '').includes(normalized))
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

  const hasAnyFilter = searchQuery || ageMin || ageMax || phoneFilter || genderFilter

  if (hasAnyFilter) {
    const all = await fetchAllUsers(signal)
    const filtered = filterUsersClientSide(all, filters, sortBy, order)
    const total = filtered.length
    const users = filtered.slice(skip, skip + limit)
    return { users, total, skip, limit }
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
