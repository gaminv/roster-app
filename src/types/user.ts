export interface User {
  id: number
  firstName: string
  lastName: string
  maidenName?: string
  age: number
  gender: string
  email: string
  phone: string
  image?: string
  height?: number
  weight?: number
  address?: {
    address?: string
    city?: string
    state?: string
    stateCode?: string
    postalCode?: string
    country?: string
    coordinates?: { lat: number; lng: number }
  }
}

export interface UsersResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}
