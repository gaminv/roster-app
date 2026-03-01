/**
 * Sort state and column types for the users table.
 */

export const SORT_STATES = ['none', 'asc', 'desc'] as const
export type SortState = (typeof SORT_STATES)[number]

export const SORT_COLUMNS = [
  'lastName',
  'firstName',
  'maidenName',
  'age',
  'gender',
  'phone',
] as const
export type SortColumn = (typeof SORT_COLUMNS)[number]
