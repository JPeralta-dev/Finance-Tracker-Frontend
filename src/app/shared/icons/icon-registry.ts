// Authentic Telegram Brand Icon SVG
const brandTelegram = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:var(--ng-icon__size, 1em);height:var(--ng-icon__size, 1em)"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472z"/></svg>';

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
  heroCalendar,
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
  heroArrowRight,
  heroClipboardDocumentList,
  heroCog6Tooth,
  heroUser,
  heroArrowRightOnRectangle,
  heroQuestionMarkCircle,
  heroPaperAirplane,
  heroSun,
  heroMoon,
  heroPencilSquare,
  heroGlobeAlt,
  heroClock,
  heroLockClosed,
  heroShieldCheck,
  heroChatBubbleLeftRight,
  heroUserGroup,
  heroCurrencyDollar,
  heroEnvelope,
  heroDocumentText,
  heroCodeBracket,
  heroBuildingOffice,
  heroChevronDown,
  heroChevronUp,
  heroStar,
  heroBookOpen,
  heroBriefcase,
  heroLink,
  heroLightBulb,
  heroArrowDownOnSquareStack,
  heroTrash,
} from '@ng-icons/heroicons/outline';

// ─── Icon Map ────────────────────────────────────────────────────────────────

export const ICONS = {
  // Navigation
  home: heroHome,
  dashboard: heroSquares2x2,
  transactions: heroCreditCard,
  categories: heroTag,
  analytics: heroChartBar,
  insights: heroLightBulb,
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
  arrowRight: heroArrowRight,
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

  // Analytics
  chart: heroChartBar,
  trendingUp: heroArrowTrendingUp,
  trendingDown: heroArrowTrendingDown,
  percent: heroBanknotes,
  calendar: heroCalendar,
  chevronDown: heroChevronDown,
  chevronUp: heroChevronUp,

  // Insights
  star: heroStar,
  alertTriangle: heroExclamationTriangle,
  repeat: heroArrowPath,

  // Category fallbacks
  book: heroBookOpen,
  briefcase: heroBriefcase,
  circle: heroCircleStack,
  car: heroBolt,
  gamepad: heroStar,
  bag: heroShoppingBag,
  zap: heroBolt,
  code: heroCodeBracket,

  // Profile
  user: heroUser,
  help: heroQuestionMarkCircle,
  list: heroClipboardDocumentList,
  telegram: brandTelegram,
  gmail: heroEnvelope,

  // Theme
  sun: heroSun,
  moon: heroMoon,

  // Actions
  edit: heroPencilSquare,

  // Language / i18n
  globe: heroGlobeAlt,

  // Misc
  clock: heroClock,
  lockClosed: heroLockClosed,
  shieldCheck: heroShieldCheck,
  chatBubble: heroChatBubbleLeftRight,
  userGroup: heroUserGroup,

  // Hero background art
  currencyDollar: heroCurrencyDollar,

  // Footer
  envelope: heroEnvelope,
  documentText: heroDocumentText,
  codeBracket: heroCodeBracket,
  buildingOffice: heroBuildingOffice,
  link: heroLink,

  // Data management
  documentArrowDown: heroArrowDownOnSquareStack,
  trash: heroTrash,
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
