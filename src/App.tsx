import { useState, useCallback, useMemo, useEffect } from 'react'
import { useUsers } from './hooks/useUsers'
import { useDebounce } from './hooks/useDebounce'
import { UsersTable } from './components/UsersTable'
import { UserModal } from './components/UserModal'
import { Filters } from './components/Filters'
import { Pagination } from './components/Pagination'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useTheme } from './contexts/ThemeContext'
import type { User } from './types/user'
import type { SortColumn, SortState } from './types/sort'
import { SORT_STATES } from './types/sort'
import { DEFAULT_COLUMN_WIDTHS, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH, PAGE_SIZE } from './constants/layout'
import { DEBOUNCE_MS, SLOW_HINT_DELAY_MS } from './constants/config'
import { MESSAGES } from './constants/messages'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortState, setSortState] = useState<SortState>('none')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const debouncedFilters = useDebounce(filters, DEBOUNCE_MS)
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)

  const sortParams = useMemo(() => {
    if (!sortColumn || sortState === 'none') return {}
    return {
      sortBy: sortColumn,
      order: sortState as 'asc' | 'desc',
    }
  }, [sortColumn, sortState])

  const handleHeaderClick = useCallback(
    (column: SortColumn) => {
      if (sortColumn === column) {
        setSortState((prev) => {
          const idx = SORT_STATES.indexOf(prev)
          return SORT_STATES[(idx + 1) % SORT_STATES.length]
        })
      } else {
        setSortColumn(column)
        setSortState('asc')
      }
      setPage(1)
    },
    [sortColumn]
  )

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const handleColumnResize = useCallback((columnKey: string, newWidth: number) => {
    setColumnWidths((w) => ({
      ...w,
      [columnKey]: Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, newWidth)),
    }))
  }, [])

  const { users, total, loading, error, refetch } = useUsers({
    page,
    limit: PAGE_SIZE,
    ...sortParams,
    filters: debouncedFilters,
  })

  const [showSlowHint, setShowSlowHint] = useState(false)

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setShowSlowHint(true), SLOW_HINT_DELAY_MS)
      return () => clearTimeout(t)
    }
    setShowSlowHint(false)
  }, [loading])

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="header">
          <div className="header__top">
            <div className="header__brand">
              <img
                src="/usertable_logo_exact.svg"
                alt=""
                className="header__logo"
                width="40"
                height="36"
              />
              <h1>UserTable</h1>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <p className="subtitle">Таблица пользователей — просмотр, сортировка и фильтрация</p>
        </header>

        <Filters filters={filters} onFilterChange={handleFilterChange} />

        <main className="main">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button type="button" onClick={refetch}>
                {MESSAGES.RETRY}
              </button>
            </div>
          )}

          <div className={`table-wrapper ${loading ? 'table-wrapper--loading' : ''}`}>
            <UsersTable
              users={users}
              sortColumn={sortColumn}
              sortState={sortState}
              columnWidths={columnWidths}
              onHeaderClick={handleHeaderClick}
              onRowClick={setSelectedUser}
              onColumnResize={handleColumnResize}
            />
          </div>

          {loading && (
            <div className="loading-bar" aria-hidden="true">
              <div className="loading-bar__fill" />
            </div>
          )}

          {loading && showSlowHint && (
            <div className="slow-hint">
              <span>{MESSAGES.SLOW_HINT}</span>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            loading={loading}
          />
        </main>

        {selectedUser && (
          <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
