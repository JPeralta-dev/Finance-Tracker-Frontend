/**
 * Icon Registry — Centralized icon mapping for the Obsidian Glass design system.
 * Maps categories, nav items, and UI elements to Heroicons SVG components.
 *
 * Using @ng-icons/heroicons v26 (outline)
 * Note: v26 uses 'hero' prefix without 'Outline' suffix
 */

import {
  heroHome,
  heroSquares2x2,
  heroCreditCard,
  heroTag,
  heroChartBar,
  heroBell,
  heroMagnifyingGlass,
  heroPlus,
  heroArrowTrendingUp,
  heroArrowTrendingDown,
  heroWallet,
  heroBanknotes,
  heroShoppingBag,
  heroShoppingCart,
  heroBuildingLibrary,
  heroBolt,
  heroHeart,
  heroCircleStack,
  heroArrowPath,
  heroEllipsisHorizontal,
  heroXMark,
  heroBars3,
  heroChevronLeft,
  heroChevronRight,
  heroCheck,
  heroExclamationTriangle,
  heroInformationCircle,
  heroFunnel,
  heroArrowUp,
  heroArrowDown,
  heroClipboardDocumentList,
  heroCog6Tooth,
  heroUser,
  heroArrowRightOnRectangle,
  heroQuestionMarkCircle,
} from '@ng-icons/heroicons/outline';

// ─── Icon Map ────────────────────────────────────────────────────────────────

export const ICONS = {
  // Navigation
  home: heroHome,
  dashboard: heroSquares2x2,
  transactions: heroCreditCard,
  categories: heroTag,
  analytics: heroChartBar,
  settings: heroCog6Tooth,
  logout: heroArrowRightOnRectangle,

  // UI Actions
  plus: heroPlus,
  search: heroMagnifyingGlass,
  bell: heroBell,
  close: heroXMark,
  menu: heroBars3,
  chevronLeft: heroChevronLeft,
  chevronRight: heroChevronRight,
  check: heroCheck,
  warning: heroExclamationTriangle,
  info: heroInformationCircle,
  filter: heroFunnel,
  arrowUp: heroArrowUp,
  arrowDown: heroArrowDown,
  ellipsis: heroEllipsisHorizontal,

  // Finance / Categories
  wallet: heroWallet,
  income: heroBanknotes,
  expense: heroShoppingCart,
  food: heroShoppingBag,
  transport: heroBolt,
  entertainment: heroHeart,
  shopping: heroShoppingBag,
  health: heroHeart,
  rent: heroBuildingLibrary,
  salary: heroBanknotes,
  freelance: heroCircleStack,
  utilities: heroBolt,
  subscription: heroArrowPath,
  other: heroEllipsisHorizontal,

  // Trends
  trendUp: heroArrowTrendingUp,
  trendDown: heroArrowTrendingDown,

  // Profile
  user: heroUser,
  help: heroQuestionMarkCircle,
  list: heroClipboardDocumentList,
};

// ─── Category Icon Mapping ───────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, keyof typeof ICONS> = {
  Income: 'income',
  Food: 'food',
  Transport: 'transport',
  Entertainment: 'entertainment',
  Shopping: 'shopping',
  Health: 'health',
  Rent: 'rent',
  Salary: 'salary',
  Freelance: 'freelance',
  Utilities: 'utilities',
  Subscription: 'subscription',
  Other: 'other',
};

export function getCategoryIcon(category: string): keyof typeof ICONS {
  return CATEGORY_ICONS[category] ?? 'other';
}
