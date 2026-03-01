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
      <p className="filters__hint">
        Учитываются все заполненные поля: поиск по имени, фамилии и отчеству, возраст (от/до), пол, телефон. Пробелы и дефисы в номере не учитываются.
      </p>
      <div className="filters__row">
        <div className="filter-group">
          <label htmlFor="filter-name">ФИО</label>
          <input
            id="filter-name"
            type="text"
            placeholder="Имя, фамилия или отчество..."
            value={filters.search ?? ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-age-min">Возраст от</label>
          <input
            id="filter-age-min"
            type="number"
            placeholder="18"
            min={0}
            max={120}
            value={filters.ageMin ?? ''}
            onChange={(e) => onFilterChange('ageMin', e.target.value)}
            className="filter-input filter-input--number"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-age-max">Возраст до</label>
          <input
            id="filter-age-max"
            type="number"
            placeholder="99"
            min={0}
            max={120}
            value={filters.ageMax ?? ''}
            onChange={(e) => onFilterChange('ageMax', e.target.value)}
            className="filter-input filter-input--number"
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
            placeholder="Введите номер"
            value={filters.phone ?? ''}
            onChange={(e) => onFilterChange('phone', e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
    </div>
  )
}
