/**
 * User-facing messages. Single source for UI and API error text.
 */

export const MESSAGES = {
  /** Timeout / slow API (banner + cache note) */
  TIMEOUT:
    'Превышено время ожидания. Настоятельно рекомендуется включить VPN — обновление страницы не помогает. Данные из кэша сохранены.',
  /** Shown when loading takes longer than SLOW_HINT_DELAY_MS */
  SLOW_HINT:
    'Загрузка идёт дольше обычного. Настоятельно рекомендуется включить VPN — обновление страницы не помогает.',
  /** Generic fetch error */
  LOAD_ERROR: (status: number, statusText: string) =>
    `Ошибка загрузки: ${status} ${statusText}`,
  /** Fallback when error has no message */
  UNKNOWN_ERROR: 'Произошла ошибка при загрузке данных',
  /** Retry button in error banner */
  RETRY: 'Повторить',
  /** Empty table body */
  NO_DATA: 'Нет данных',
  /** Filter section hint */
  FILTER_HINT:
    'Учитываются все заполненные поля: поиск по имени, фамилии и отчеству, возраст (от/до), пол, телефон.',
  /** Filter placeholders */
  PLACEHOLDER_FIO: 'Имя, фамилия или отчество...',
  PLACEHOLDER_AGE_MIN: '18',
  PLACEHOLDER_AGE_MAX: '99',
  PLACEHOLDER_PHONE: 'Введите номер',
  /** Error boundary fallback UI */
  ERROR_BOUNDARY_TITLE: 'Произошла ошибка',
  ERROR_BOUNDARY_UNKNOWN: 'Неизвестная ошибка',
  ERROR_BOUNDARY_RETRY: 'Попробовать снова',
  /** Pagination: "Показано 1-10 из 100" or "Показано 0 из 0" */
  PAGINATION_SHOWN: (start: number, end: number, total: number) =>
    total === 0 ? 'Показано 0 из 0' : `Показано ${start}-${end} из ${total}`,
  /** Pagination: "1 / 5" */
  PAGINATION_PAGE: (current: number, total: number) => `${current} / ${total}`,
  /** Pagination aria-labels */
  PAGINATION_FIRST: 'Первая страница',
  PAGINATION_PREV: 'Предыдущая страница',
  PAGINATION_NEXT: 'Следующая страница',
  PAGINATION_LAST: 'Последняя страница',
} as const
