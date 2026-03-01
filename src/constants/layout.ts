/**
 * Layout constants shared between components and styles.
 * Values align with src/styles/_variables.scss where applicable.
 */

export const MIN_COLUMN_WIDTH = 50;
export const APP_MAX_WIDTH = 1400;
export const PAGE_SIZE = 10;

/** Default column widths (px) for the users table */
export const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  lastName: 120,
  firstName: 120,
  maidenName: 120,
  age: 80,
  gender: 100,
  phone: 150,
  email: 200,
  country: 120,
  city: 120,
};
