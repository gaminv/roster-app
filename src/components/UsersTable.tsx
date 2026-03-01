import { useRef, useCallback } from 'react'
import type { User } from '../types/user'
import type { SortColumn, SortState } from '../types/sort'
import { MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH } from '../constants/layout'
import {
  TABLE_COLUMNS,
  SORTABLE_COLUMNS,
  DEFAULT_TABLE_COLUMN_WIDTH,
  EMPTY_CELL,
} from '../constants/table'
import { MESSAGES } from '../constants/messages'

const SORT_ICONS: Record<SortState, string> = {
  none: '⇅',
  asc: '↑',
  desc: '↓',
}

interface UsersTableProps {
  users: User[]
  sortColumn: SortColumn | null
  sortState: SortState
  columnWidths: Record<string, number>
  onHeaderClick: (column: SortColumn) => void
  onRowClick: (user: User) => void
  onColumnResize: (columnKey: string, newWidth: number) => void
}

function getCellValue(user: User, key: string): string {
  if (key === 'country') return user.address?.country ?? EMPTY_CELL
  if (key === 'city') return user.address?.city ?? EMPTY_CELL
  const v = (user as unknown as Record<string, unknown>)[key]
  return v != null && v !== '' ? String(v) : EMPTY_CELL
}

export function UsersTable({
  users,
  sortColumn,
  sortState,
  columnWidths,
  onHeaderClick,
  onRowClick,
  onColumnResize,
}: UsersTableProps) {
  const resizeRef = useRef<{
    key: string
    startX: number
    startWidth: number
    onResize: (key: string, w: number) => void
  } | null>(null)

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startWidth = columnWidths[key] ?? DEFAULT_TABLE_COLUMN_WIDTH

      const onMove = (moveEvent: MouseEvent) => {
        const data = resizeRef.current
        if (!data) return
        const diff = moveEvent.clientX - data.startX
        const next = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, data.startWidth + diff))
        data.onResize(data.key, next)
      }

      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        resizeRef.current = null
      }

      resizeRef.current = { key, startX, startWidth, onResize: onColumnResize }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [columnWidths, onColumnResize]
  )

  return (
    <table className="users-table">
      <thead>
        <tr>
          {TABLE_COLUMNS.map((col) => {
            const isSortable =
              col.sortable && SORTABLE_COLUMNS.includes(col.key as SortColumn)
            const isActive = sortColumn === col.key
            const icon = isActive ? SORT_ICONS[sortState] : SORT_ICONS.none

            return (
              <th
                key={col.key}
                className={`users-table__th ${isSortable ? 'users-table__th--sortable' : ''} ${isActive ? 'users-table__th--active' : ''}`}
                style={{
                  width: columnWidths[col.key] ?? DEFAULT_TABLE_COLUMN_WIDTH,
                  minWidth: MIN_COLUMN_WIDTH,
                  maxWidth: MAX_COLUMN_WIDTH,
                }}
                onClick={isSortable ? () => onHeaderClick(col.key as SortColumn) : undefined}
              >
                <span className="users-table__th-content">
                  {col.label}
                  {isSortable && <span className="users-table__sort-icon">{icon}</span>}
                </span>
                <div
                  className="users-table__resizer"
                  onMouseDown={(e) => handleResizeMouseDown(e, col.key)}
                  role="separator"
                  aria-orientation="vertical"
                />
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={TABLE_COLUMNS.length} className="users-table__empty">
              {MESSAGES.NO_DATA}
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr
              key={user.id}
              className="users-table__row"
              onClick={() => onRowClick(user)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick(user)
                }
              }}
            >
              {TABLE_COLUMNS.map((col) => (
                <td key={col.key} className="users-table__td">
                  {getCellValue(user, col.key)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
