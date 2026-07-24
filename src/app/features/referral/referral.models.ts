/**
 * Referral domain types — shared contracts for the referral system.
 */
import { SubscriptionTier } from '../../core/models/user.model';

export interface ReferralCode {
  /** 8-character alphanumeric code (uppercase, case-insensitive on input) */
  code: string;
  /** User id this code belongs to */
  userId: string;
  createdAt: string;
}

export interface ReferralStats {
  /** Number of referred users who completed signup */
  referralCount: number;
  /** Number of months of discount earned (1 per successful subscription) */
  totalDiscountMonths: number;
  /** Total pending referrals (signed up but not yet subscribed) */
  pendingCount: number;
}

export interface ReferralRedemption {
  code: string;
  referredUserId: string;
  referrerUserId: string;
  discountApplied: boolean;
  redeemedAt: string;
}

export interface ReferralInfo {
  code: ReferralCode;
  /** Full shareable URL — e.g. https://flowr.finance/ref/ABC123XY */
  link: string;
  stats: ReferralStats;
}

export type ShareMethod = 'email' | 'whatsapp' | 'twitter' | 'telegram' | 'copy' | 'native_share';

export interface ShareTarget {
  method: ShareMethod;
  /** Pre-built URL that opens the share flow (mailto:, https://wa.me/, etc.) */
  url: string;
  /** Human-readable label for the button */
  label: string;
}

/** A user's tier — used to gate the referral page to premium+ users per spec. */
export type EligibleTier = Extract<SubscriptionTier, 'premium' | 'premium_plus'>;
