/**
 * Layout constants shared between components and styles.
 * Values align with src/styles/_variables.scss where applicable.
 */

export const MIN_COLUMN_WIDTH = 50;
export const MAX_COLUMN_WIDTH = 280;
export const APP_MAX_WIDTH = 1400;
export const PAGE_SIZE = 10;

/**
 * Default column widths (px) for the users table.
 * Sum fits within APP_MAX_WIDTH for typical viewports.
 */
export const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  lastName: 110,
  firstName: 110,
  maidenName: 110,
  age: 70,
  gender: 90,
  phone: 140,
  email: 180,
  country: 110,
  city: 110,
};
