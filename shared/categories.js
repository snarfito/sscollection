export const CATEGORIES = ['Dama', 'Caballero', 'Zapatos', 'Bolsos'];

export function isValidCategory(value) {
  return CATEGORIES.includes(value);
}
