interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  loading = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="pagination">
      <div className="pagination__info">
        Показано {totalItems === 0 ? 0 : `${start}-${end}`} из {totalItems}
      </div>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(1)}
          disabled={!canPrev || loading}
          aria-label="Первая страница"
        >
          ««
        </button>
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev || loading}
          aria-label="Предыдущая страница"
        >
          ‹
        </button>
        <span className="pagination__page">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext || loading}
          aria-label="Следующая страница"
        >
          ›
        </button>
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext || loading}
          aria-label="Последняя страница"
        >
          »»
        </button>
      </div>
    </div>
  )
}
