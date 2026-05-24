import { CategoryMeta } from '../transaction.types';
import { getCategoryIcon } from '../../../shared/icons/icon-registry';

/**
 * Category metadata — colors for the Obsidian Glass theme.
 * Icons are now handled by the icon registry (Heroicons SVG).
 */
export const CATEGORY_META: Record<string, CategoryMeta> = {
  Income: { icon: '', color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.12)' },
  Food: { icon: '', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.12)' },
  Transport: { icon: '', color: '#118DFF', bg: 'rgba(17, 141, 255, 0.12)' },
  Entertainment: { icon: '', color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.12)' },
  Shopping: { icon: '', color: '#FFD93D', bg: 'rgba(255, 217, 61, 0.12)' },
  Health: { icon: '', color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.12)' },
  Rent: { icon: '', color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.12)' },
  Salary: { icon: '', color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.12)' },
  Freelance: { icon: '', color: '#118DFF', bg: 'rgba(17, 141, 255, 0.12)' },
  Utilities: { icon: '', color: '#FFD93D', bg: 'rgba(255, 217, 61, 0.12)' },
  Subscription: { icon: '', color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.12)' },
  Other: { icon: '', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
};

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META['Other'];
}

export { getCategoryIcon };
