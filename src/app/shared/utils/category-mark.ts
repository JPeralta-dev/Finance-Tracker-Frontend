/**
 * Derives a 2-letter mark from a category name.
 * Splits on non-alphanumeric boundaries, takes first 2 initials, uppercase.
 * Falls back to "??" for empty or unparseable names.
 */
export function categoryMark(name: string): string {
  return name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || '??';
}
