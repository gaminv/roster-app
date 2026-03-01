interface FiltersProps {
  filters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
}

const GENDER_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
]

export function Filters({ filters, onFilterChange }: FiltersProps) {
  return (
    <div className="filters">
      <div className="filters__row">
        <div className="filter-group">
          <label htmlFor="filter-name">ФИО</label>
          <input
            id="filter-name"
            type="text"
            placeholder="Поиск по имени..."
            value={filters.search ?? ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-age">Возраст</label>
          <input
            id="filter-age"
            type="text"
            placeholder="Например: 28"
            value={filters.age ?? ''}
            onChange={(e) => onFilterChange('age', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-gender">Пол</label>
          <select
            id="filter-gender"
            value={filters.gender ?? ''}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="filter-select"
          >
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-phone">Телефон</label>
          <input
            id="filter-phone"
            type="text"
            placeholder="Поиск по номеру..."
            value={filters.phone ?? ''}
            onChange={(e) => onFilterChange('phone', e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
    </div>
  )
}
