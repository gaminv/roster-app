/**
 * Application configuration.
 * API, timing and feature constants — no UI strings.
 */

export const API_BASE_URL = 'https://dummyjson.com/users'

/** Max users fetched when applying client-side filters/sort (e.g. maidenName) */
export const MAX_USERS_FOR_CLIENT_FILTER = 200

/** Debounce delay for filter inputs (ms) */
export const DEBOUNCE_MS = 400

/** After this loading duration (ms), show "slow connection" hint */
export const SLOW_HINT_DELAY_MS = 6000

/** Age filter bounds (for input min/max and placeholder) */
export const AGE_FILTER_MIN = 0
export const AGE_FILTER_MAX = 120
