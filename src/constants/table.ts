/**
 * Table column definitions and display constants.
 */

import type { SortColumn } from '../types/sort'

export interface TableColumnConfig {
  key: string
  label: string
  sortable: boolean
}

export const TABLE_COLUMNS: TableColumnConfig[] = [
  { key: 'lastName', label: 'Фамилия', sortable: true },
  { key: 'firstName', label: 'Имя', sortable: true },
  { key: 'maidenName', label: 'Отчество', sortable: true },
  { key: 'age', label: 'Возраст', sortable: true },
  { key: 'gender', label: 'Пол', sortable: true },
  { key: 'phone', label: 'Телефон', sortable: true },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'country', label: 'Страна', sortable: false },
  { key: 'city', label: 'Город', sortable: false },
]

export const SORTABLE_COLUMNS: SortColumn[] = [
  'lastName',
  'firstName',
  'maidenName',
  'age',
  'gender',
  'phone',
]

/** Fallback width (px) when column has no stored width */
export const DEFAULT_TABLE_COLUMN_WIDTH = 120

/** Placeholder for empty cell in table */
export const EMPTY_CELL = '-'
