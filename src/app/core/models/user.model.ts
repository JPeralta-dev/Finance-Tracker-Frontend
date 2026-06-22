export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';
export type SubscriptionStatus = 'no_trial' | 'active_trial' | 'trial_expired' | 'premium_active' | 'premium_expired';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  trialStart: string | null;
  trialEnd: string | null;
  premiumStart: string | null;
  premiumEnd: string | null;
  status: SubscriptionStatus;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  subscription?: SubscriptionInfo;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}
