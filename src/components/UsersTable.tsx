import { useRef, useCallback } from 'react'
import type { User } from '../types/user'
import { MIN_COLUMN_WIDTH } from '../constants/layout'
import type { SortColumn, SortState } from '../App'

interface UsersTableProps {
  users: User[]
  sortColumn: SortColumn | null
  sortState: SortState
  columnWidths: Record<string, number>
  onHeaderClick: (column: SortColumn) => void
  onRowClick: (user: User) => void
  onColumnResize: (columnKey: string, newWidth: number) => void
}

const COLUMNS: { key: string; label: string; sortable: boolean }[] = [
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

const SORT_LABEL_MAP: Record<string, SortColumn> = {
  lastName: 'name',
  firstName: 'name',
  maidenName: 'name',
  age: 'age',
  gender: 'gender',
  phone: 'phone',
}

const SORT_ICONS = {
  none: '⇅',
  asc: '↑',
  desc: '↓',
}

function getCellValue(user: User, key: string): string {
  if (key === 'country') return user.address?.country ?? '-'
  if (key === 'city') return user.address?.city ?? '-'
  const v = (user as unknown as Record<string, unknown>)[key]
  return v != null && v !== '' ? String(v) : '-'
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
      const startWidth = columnWidths[key] ?? 120

      const onMove = (moveEvent: MouseEvent) => {
        const data = resizeRef.current
        if (!data) return
        const diff = moveEvent.clientX - data.startX
        data.onResize(data.key, Math.max(MIN_COLUMN_WIDTH, data.startWidth + diff))
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
          {COLUMNS.map((col) => {
            const sortCol = SORT_LABEL_MAP[col.key]
            const isSortable = col.sortable && sortCol
            const isActive = sortColumn === sortCol
            const icon = isActive ? SORT_ICONS[sortState] : SORT_ICONS.none

            return (
              <th
                key={col.key}
                className={`users-table__th ${isSortable ? 'users-table__th--sortable' : ''} ${isActive ? 'users-table__th--active' : ''}`}
                style={{ width: columnWidths[col.key] ?? 120, minWidth: MIN_COLUMN_WIDTH }}
                onClick={isSortable ? () => onHeaderClick(sortCol) : undefined}
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
            <td colSpan={COLUMNS.length} className="users-table__empty">
              Нет данных
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
              {COLUMNS.map((col) => (
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
