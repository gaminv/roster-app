import { MESSAGES } from '../constants/messages'
import { AGE_FILTER_MIN, AGE_FILTER_MAX } from '../constants/config'

interface FiltersProps {
  filters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
}

const GENDER_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
] as const

export function Filters({ filters, onFilterChange }: FiltersProps) {
  return (
    <div className="filters">
      <p className="filters__hint">{MESSAGES.FILTER_HINT}</p>
      <div className="filters__row">
        <div className="filter-group">
          <label htmlFor="filter-name">ФИО</label>
          <input
            id="filter-name"
            type="text"
            placeholder={MESSAGES.PLACEHOLDER_FIO}
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
            placeholder={MESSAGES.PLACEHOLDER_AGE_MIN}
            min={AGE_FILTER_MIN}
            max={AGE_FILTER_MAX}
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
            placeholder={MESSAGES.PLACEHOLDER_AGE_MAX}
            min={AGE_FILTER_MIN}
            max={AGE_FILTER_MAX}
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
            placeholder={MESSAGES.PLACEHOLDER_PHONE}
            value={filters.phone ?? ''}
            onChange={(e) => onFilterChange('phone', e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
    </div>
  )
}
