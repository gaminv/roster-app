import type { User, UsersResponse } from '../types/user'
import {
  fetchWithTimeoutAndRetry,
  withTimeout,
  REQUEST_TIMEOUT_MS,
  RETRY_COUNT,
} from './fetchWithTimeout'
import { API_BASE_URL, MAX_USERS_FOR_CLIENT_FILTER } from '../constants/config'
import { MESSAGES } from '../constants/messages'

export interface FetchUsersParams {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, string>
  signal?: AbortSignal
}

function isEmptyValue(v: unknown): boolean {
  return v == null || v === '' || String(v).trim() === '-'
}

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
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    list = list.filter((u) =>
      tokens.every(
        (token) =>
          (u.firstName ?? '').toLowerCase().includes(token) ||
          (u.lastName ?? '').toLowerCase().includes(token) ||
          (u.maidenName ?? '').toLowerCase().includes(token)
      )
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
      if (sortBy === 'maidenName') {
        const aEmpty = isEmptyValue(av)
        const bEmpty = isEmptyValue(bv)
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return order === 'asc' ? 1 : -1
        if (bEmpty) return order === 'asc' ? -1 : 1
      } else {
        if (av == null) return 1
        if (bv == null) return -1
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return order === 'asc' ? cmp : -cmp
    })
  }
  return list
}

async function fetchAllUsers(signal?: AbortSignal): Promise<User[]> {
  const url = new URL(API_BASE_URL)
  url.searchParams.set('limit', String(MAX_USERS_FOR_CLIENT_FILTER))
  url.searchParams.set('skip', '0')
  const res = await fetchWithTimeoutAndRetry(url.toString(), { signal })
  if (!res.ok) throw new Error(MESSAGES.LOAD_ERROR(res.status, res.statusText))
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

  const needsClientSort = sortBy === 'maidenName'
  const hasAnyFilter =
    searchQuery || ageMin || ageMax || phoneFilter || genderFilter || needsClientSort

  if (hasAnyFilter) {
    const all = await fetchAllUsers(signal)
    const filtered = filterUsersClientSide(all, filters, sortBy, order)
    const total = filtered.length
    const users = filtered.slice(skip, skip + limit)
    return { users, total, skip, limit }
  }

  const url = new URL(API_BASE_URL)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('skip', String(skip))
  if (sortBy && order && sortBy !== 'maidenName') {
    url.searchParams.set('sortBy', sortBy)
    url.searchParams.set('order', order)
  }
  const res = await fetchWithTimeoutAndRetry(url.toString(), { signal })
  if (!res.ok) throw new Error(MESSAGES.LOAD_ERROR(res.status, res.statusText))
  const data = await res.json()
  if (sortBy === 'maidenName' && order && data.users?.length) {
    data.users.sort((a: User, b: User) => {
      const av = a.maidenName
      const bv = b.maidenName
      const aEmpty = isEmptyValue(av)
      const bEmpty = isEmptyValue(bv)
      if (aEmpty && bEmpty) return 0
      if (aEmpty) return order === 'asc' ? 1 : -1
      if (bEmpty) return order === 'asc' ? -1 : 1
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return order === 'asc' ? cmp : -cmp
    })
  }
  return data
}

export async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
  const maxWaitMs = (1 + RETRY_COUNT) * REQUEST_TIMEOUT_MS * 2
  return withTimeout(doFetchUsers(params), maxWaitMs, MESSAGES.TIMEOUT)
}

export async function fetchUserById(id: number, signal?: AbortSignal): Promise<User> {
  const res = await fetchWithTimeoutAndRetry(`${API_BASE_URL}/${id}`, { signal })
  if (!res.ok) throw new Error(MESSAGES.LOAD_ERROR(res.status, res.statusText))
  return res.json()
}
