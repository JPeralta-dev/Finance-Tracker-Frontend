/**
 * Tier-comparison model used by FtUpgradeModalComponent.
 *
 * Each row represents a single feature and how it is included (or not)
 * in each of the three tiers. The modal renders a 3-column table from
 * these rows so the comparison stays data-driven.
 */
import { SubscriptionTier } from '../../core/models/user.model';

export type TierCellValue = boolean | string;

export interface TierComparisonRow {
  /** Translation key for the feature name (e.g. "upgradeModal.features.aiInsights") */
  featureKey: string;
  /** Optional secondary descriptor (sub-label, e.g. "Unlimited") */
  subLabelKey?: string;
  /** Value shown for each tier. `true` = check, `false` = dash, string = literal text */
  free: TierCellValue;
  premium: TierCellValue;
  premium_plus: TierCellValue;
  /** Highlights the row as a "key" feature (e.g. AI, goals) for visual emphasis */
  highlight?: boolean;
}

export interface TierComparisonColumn {
  tier: SubscriptionTier;
  nameKey: string;
  taglineKey: string;
  highlight: boolean;
  ctaKey: string;
}

export const DEFAULT_TIER_COLUMNS: TierComparisonColumn[] = [
  {
    tier: 'free',
    nameKey: 'upgradeModal.tiers.free.name',
    taglineKey: 'upgradeModal.tiers.free.tagline',
    highlight: false,
    ctaKey: 'upgradeModal.tiers.free.cta',
  },
  {
    tier: 'premium',
    nameKey: 'upgradeModal.tiers.premium.name',
    taglineKey: 'upgradeModal.tiers.premium.tagline',
    highlight: true,
    ctaKey: 'upgradeModal.tiers.premium.cta',
  },
  {
    tier: 'premium_plus',
    nameKey: 'upgradeModal.tiers.premiumPlus.name',
    taglineKey: 'upgradeModal.tiers.premiumPlus.tagline',
    highlight: false,
    ctaKey: 'upgradeModal.tiers.premiumPlus.cta',
  },
];

export const DEFAULT_TIER_ROWS: TierComparisonRow[] = [
  {
    featureKey: 'upgradeModal.features.transactions',
    free: true,
    premium: true,
    premium_plus: true,
  },
  {
    featureKey: 'upgradeModal.features.basicCharts',
    free: true,
    premium: true,
    premium_plus: true,
  },
  {
    featureKey: 'upgradeModal.features.customCategories',
    free: true,
    premium: true,
    premium_plus: true,
  },
  {
    featureKey: 'upgradeModal.features.history',
    free: '30d',
    premium: '12m',
    premium_plus: '24m',
  },
  {
    featureKey: 'upgradeModal.features.aiInsights',
    subLabelKey: 'upgradeModal.features.aiInsightsSub',
    free: false,
    premium: true,
    premium_plus: true,
    highlight: true,
  },
  {
    featureKey: 'upgradeModal.features.goals',
    subLabelKey: 'upgradeModal.features.goalsSub',
    free: false,
    premium: true,
    premium_plus: true,
    highlight: true,
  },
  {
    featureKey: 'upgradeModal.features.aiChat',
    free: false,
    premium: false,
    premium_plus: true,
  },
  {
    featureKey: 'upgradeModal.features.telegramIntegration',
    free: false,
    premium: false,
    premium_plus: true,
  },
  {
    featureKey: 'upgradeModal.features.exportPdf',
    free: false,
    premium: false,
    premium_plus: true,
  },
  {
    featureKey: 'upgradeModal.features.prioritySupport',
    free: false,
    premium: false,
    premium_plus: true,
  },
];
