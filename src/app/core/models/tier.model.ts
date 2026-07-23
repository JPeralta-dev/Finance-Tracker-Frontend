/**
 * Tier Model — Shared between landing page and subscription page.
 *
 * Pricing data and feature comparisons are derived from this single source
 * of truth so the marketing site never drifts from the real product.
 */

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface TierFeature {
  /** i18n key for the feature text */
  textKey: string;
  /** Whether the feature is included in this tier */
  included: boolean;
}

export interface TierCard {
  id: SubscriptionTier;
  /** i18n key for the display name (e.g. 'landing.pricing.tiers.premium.name') */
  nameKey: string;
  /** Display price string (already formatted for current locale) */
  price: string;
  /** Annual price string (shown when annual billing selected) */
  priceAnnual: string;
  /** Optional annual savings callout (e.g. 'Save 33%') */
  annualSavingsKey?: string;
  /** Whether this tier is the most popular/recommended */
  popular: boolean;
  /** i18n keys for the feature list */
  featureKeys: string[];
  /** i18n key for the CTA button label */
  ctaKey: string;
  /** Whether to render this card with the highlighted/elevated style */
  highlighted: boolean;
}

export interface TierComparisonRow {
  /** i18n key for the feature name */
  featureKey: string;
  free: boolean;
  premium: boolean;
  premiumPlus: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  /** i18n key for the testimonial text */
  textKey: string;
  /** Two-letter initials for avatar placeholder */
  avatarInitials: string;
}

export interface FaqItem {
  /** i18n key for the question */
  questionKey: string;
  /** i18n key for the answer */
  answerKey: string;
}

export interface TrustBadge {
  /** Icon name from the icon registry */
  icon: string;
  /** i18n key for the badge label */
  labelKey: string;
}
