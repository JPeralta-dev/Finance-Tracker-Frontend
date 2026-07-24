/**
 * Analytics Event Definitions
 *
 * Single source of truth for every event name tracked through PostHog.
 * Grouped by domain so the team can audit the funnel quickly.
 *
 * Convention: snake_case, present tense, past_tense_action. Properties
 * are typed as unions of literal values to catch typos at the call site.
 */

export type AnalyticsEventName =
  // ── Conversion / paywall ──────────────────────────────────────────
  | 'paywall_modal_shown'
  | 'paywall_modal_closed'
  | 'modal_closed_without_upgrade'
  | 'modal_upgrade_clicked'
  | 'upgrade_clicked'
  | 'subscription_page_viewed'
  | 'upgrade_completed'
  | 'premium_access_attempted'

  // ── Onboarding tour ──────────────────────────────────────────────
  | 'onboarding_tour_started'
  | 'onboarding_tour_step_viewed'
  | 'onboarding_tour_completed'
  | 'onboarding_tour_skipped'

  // ── Engagement ───────────────────────────────────────────────────
  | 'premium_feature_attempted'
  | 'upgrade_prompt_shown'
  | 'upgrade_prompt_clicked'
  | 'trial_banner_shown'
  | 'trial_banner_dismissed'
  | 'trial_banner_cta_clicked'

  // ── Referral ─────────────────────────────────────────────────────
  | 'referral_link_generated'
  | 'referral_link_copied'
  | 'referral_link_shared'
  | 'referral_signup_completed'

  // ── Generic page view (used by Router instrumentation) ───────────
  | 'page_viewed';

/** Paywall modal trigger source — useful for funnel breakdown */
export type PaywallTrigger = 'premium_guard' | 'dashboard_prompt' | 'manual' | 'direct_link';

/** Onboarding step identifier (1-based, matches TourStep.id ordering) */
export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface AnalyticsProperties {
  // ── Conversion ───────────────────────────────────────────────────
  trigger?: PaywallTrigger;
  route?: string;
  tier?: 'free' | 'premium' | 'premium_plus';

  // ── Onboarding ───────────────────────────────────────────────────
  step?: OnboardingStep;
  step_id?: string;

  // ── Trial banner ─────────────────────────────────────────────────
  days_remaining?: number;
  variant?: string;

  // ── Upgrade prompt ───────────────────────────────────────────────
  feature?: 'insights' | 'goals' | 'analytics' | 'ai' | string;
  source?: string;

  // ── Referral ─────────────────────────────────────────────────────
  method?: 'email' | 'whatsapp' | 'twitter' | 'telegram' | 'copy' | 'native_share';
  code?: string;

  // ── Page view ────────────────────────────────────────────────────
  path?: string;
  referrer?: string;

  // Allow arbitrary extra properties for forward compatibility
  [key: string]: unknown;
}

/** A queued event waiting to be flushed to PostHog. */
export interface QueuedEvent {
  name: AnalyticsEventName;
  properties?: AnalyticsProperties;
  timestamp: number;
}
