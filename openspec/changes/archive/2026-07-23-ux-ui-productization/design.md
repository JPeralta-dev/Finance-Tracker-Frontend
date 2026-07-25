# Design: UX/UI Productization

## Technical Approach

Implement 8 capabilities (6 new, 2 modified) that convert free users to paying customers through paywall modals, onboarding tours, trial banners, upgrade prompts, analytics tracking, and a referral system. All components follow the existing Angular 17 standalone patterns with signals-based state management.

## Architecture Decisions

### Decision: Generic Modal Primitive

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extend `ConfirmDialogComponent` | Reuses existing animation patterns | Rejected — ConfirmDialog is confirmation-specific (confirm/cancel), modal needs generic header/content/footer slots |
| Build `FtModalComponent` from scratch | More code | Selected — Clean separation, supports all spec requirements (focus trap, scroll lock, multiple sizes) |
| Use Angular CDK Overlay | Heavy dependency | Rejected — overkill for simple modal, adds bundle bloat |

**Rationale**: ConfirmDialog uses an overlay-only pattern. Spec requires dynamic content projection, configurable sizes, focus trap, and scroll lock —需要一个更灵活的基础组件。

### Decision: Tour Engine Implementation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Angular CDK Tour or ngx-tethys | Library dependency, may not support element highlighting | Rejected — no cutout/highlight support |
| Shepherd.js integration | jQuery dependency, not Angular-native | Rejected — heavy, not signals-compatible |
| Custom `FtTourService` + components | More implementation code | Selected — full control, follows existing patterns |

**Rationale**: Need element highlighting with overlay cutout that follows scroll. Custom implementation integrates cleanly with existing animation tokens and signal-based state.

### Decision: PostHog Integration

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Direct PostHog SDK calls | Scattered tracking code | Rejected — inconsistent, hard to test |
| `FtAnalyticsService` wrapper | Extra abstraction layer | Selected — single source of truth, GDPR compliance, offline queue |

**Rationale**: Spec requires GDPR consent, event batching, offline queuing, and debug mode. Wrapper service encapsulates all PostHog complexity.

### Decision: Referral Code Format

| Option | Tradeoff | Decision |
|--------|----------|----------|
| UUID v4 (36 chars) | Too long for URLs | Rejected |
| Short nanoid (8-12 chars) | Requires server-side generation for uniqueness | Selected — 8-char base62 alphanumeric, stored in backend |

**Rationale**: 8-character base62 provides 62^8 ≈ 218 trillion combinations. Generated server-side to guarantee uniqueness.

### Decision: Tour State Persistence

| Option | Tradeoff | Decision |
|--------|----------|----------|
| localStorage only | Loses state across devices | Selected for MVP |
| Backend API sync | Requires backend work, complex | Deferred — localStorage + future API |

**Rationale**: Spec says backend sync within 1s, but MVP can use localStorage. Backend API can be added in follow-up iteration.

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthService (existing)                    │
│  subscriptionTier, isTrialActive, isPremium signals         │
└─────────────────────┬───────────────────────────────────────┘
                      │ injected
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ UpgradeModal     │     │ TrialBanner     │
│ Service          │     │ Service         │
│ (upgrade state)  │     │ (dismissal)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────┐
│           FtAnalyticsService (PostHog)           │
│  trackEvent(), identifyUser(), trackPageView()  │
└─────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/shared/ui/modal/modal.component.ts` | Create | Generic modal primitive with focus trap, scroll lock |
| `src/app/shared/ui/modal/modal.component.html` | Create | Modal template |
| `src/app/shared/ui/modal/modal.component.scss` | Create | Modal styles (glass morphism) |
| `src/app/features/upgrade/upgrade-modal.component.ts` | Create | Upgrade modal with tier comparison |
| `src/app/features/upgrade/upgrade-modal.component.html` | Create | Upgrade modal template |
| `src/app/features/upgrade/upgrade-modal.component.scss` | Create | Upgrade modal styles |
| `src/app/shared/services/analytics.service.ts` | Create | PostHog wrapper with GDPR, batching |
| `src/app/shared/services/tour.service.ts` | Create | Tour engine with step management |
| `src/app/shared/components/tour/tour-overlay.component.ts` | Create | Tour highlight overlay with cutout |
| `src/app/shared/components/tour/tour-tooltip.component.ts` | Create | Tour step tooltip |
| `src/app/shared/components/announcement-banner.component.ts` | Create | Reusable banner primitive |
| `src/app/shared/components/trial-banner.component.ts` | Create | Trial countdown banner |
| `src/app/shared/components/upgrade-prompt.component.ts` | Create | Contextual upgrade prompts |
| `src/app/shared/directives/premium-action.directive.ts` | Create | `ftPremiumAction` directive |
| `src/app/features/referral/referral.service.ts` | Create | Referral link generation, sharing |
| `src/app/features/referral/referral-page.component.ts` | Create | Referral page with share options |
| `src/app/features/referral/referral-widget.component.ts` | Create | Dashboard referral widget |
| `src/app/shared/components/empty-state.component.ts` | Modify | Add variant support (premium-upsell, first-use) |
| `src/app/core/guards/premium.guard.ts` | Modify | Show upgrade modal instead of redirect |
| `src/app/features/dashboard/pages/dashboard.page.ts` | Modify | Add trial banner + upgrade prompts |
| `src/app/features/dashboard/pages/dashboard.page.html` | Modify | Add Row 0 (trial banner), modify rows 3-4 |
| `src/app/app.routes.ts` | Modify | Add `/referral` route |
| `src/app/core/i18n/*.json` | Modify | Add translation keys for all new text |

## Interfaces / Contracts

### Modal System

```typescript
// Modal sizes
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

// FtModalComponent inputs
interface FtModalInputs {
  size?: ModalSize;           // default: 'md'
  closeOnBackdrop?: boolean;  // default: true
  closeOnEsc?: boolean;      // default: true
  showHeader?: boolean;       // default: true
  headerTitle?: string;       // i18n key
  showFooter?: boolean;       // default: true
}

// Upgrade modal specific
interface FtUpgradeModalInputs {
  tierComparisonRows: TierComparisonRow[];
  currentTier: 'free' | 'premium' | 'premium_plus';
  trialDaysRemaining?: number;
}
```

### Tour System

```typescript
interface TourStep {
  id: string;
  titleKey: string;        // i18n key
  descriptionKey: string;  // i18n key
  targetSelector: string;  // CSS selector for highlight
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  actionKey?: string;      // Optional CTA button i18n key
  actionRoute?: string;    // Optional route for action button
}

interface TourState {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  currentStep: number;     // 1-5
  completedAt: string | null;
}

interface TourConfig {
  steps: TourStep[];
  startStep?: number;
  onComplete?: () => void;
  onSkip?: () => void;
}
```

### Analytics Service

```typescript
interface FtAnalyticsConfig {
  apiKey: string;
  enabled?: boolean;       // default: false in dev
  debug?: boolean;         // default: false
}

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

// Key events
type ConversionEvent = 
  | 'paywall_modal_shown'
  | 'paywall_modal_closed'
  | 'upgrade_clicked'
  | 'subscription_page_viewed'
  | 'upgrade_completed';

type OnboardingEvent =
  | 'onboarding_tour_started'
  | 'onboarding_tour_step_viewed'
  | 'onboarding_tour_completed'
  | 'onboarding_tour_skipped';
```

### Referral System

```typescript
interface ReferralInfo {
  code: string;           // 8-char alphanumeric
  link: string;           // Full URL
  stats: ReferralStats;
}

interface ReferralStats {
  referralCount: number;
  totalDiscountMonths: number;
}

interface ReferralRedemption {
  code: string;
  referredUserId: string;
  referrerUserId: string;
  discountApplied: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Modal animation state machine | Test signal transitions: closed → opening → open → closing → closed |
| Unit | Tour step navigation logic | Test next/prev/skip/complete with mock state |
| Unit | Analytics event batching | Mock PostHog, verify batch timing and queue |
| Unit | Referral code generation | Test format validation (8-char base62) |
| Integration | Premium guard + upgrade modal | Test guard opens modal without redirect |
| Integration | Tour state persistence | localStorage write/read cycle |
| Integration | Dashboard with trial banner | Verify banner renders for trial users, hidden for premium |

## Accessibility Features

- **ARIA**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on modal header
- **Focus trap**: Focus cycles within modal, returns to trigger on close
- **Keyboard nav**: Tab/Shift+Tab in modal, ESC closes modal/banner, arrows navigate tour
- **Screen reader**: Live region for toast notifications, tour announcements
- **Reduced motion**: Respect `prefers-reduced-motion` for all animations

## Animation Specs

| Element | Enter | Exit | Duration | Easing |
|---------|-------|------|----------|--------|
| Modal overlay | fade in | fade out | 200ms | ease-out |
| Modal dialog | scale(0.95) + fade | scale(0.95) + fade | 200ms | ease-out |
| Tour overlay | fade in | fade out | 300ms | ease-in-out |
| Tour highlight | clip-path expand | clip-path collapse | 300ms | ease-in-out |
| Tour tooltip | fade + translateY(8px) | fade + translateY(8px) | 200ms | ease-out |
| Banner slide | translateY(-100%) → translateY(0) | translateY(0) → translateY(-100%) | 250ms | ease-out |
| Prompt fade | opacity 0 → 1 | opacity 1 → 0 | 200ms | ease-out |

## Threat Matrix

**N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.**

## Migration / Rollout

**No migration required.** New capabilities are additive:
- Existing dashboard continues to work (5 rows → 6 rows, new row is conditional)
- Existing `EmptyStateComponent` behavior unchanged (default variant)
- Existing `ConfirmDialogComponent` unchanged
- Feature flags control visibility if needed (not required for MVP)

## Open Questions

- [ ] Backend API endpoint: `POST /api/referral/generate` — confirm response shape
- [ ] Backend API endpoint: `GET /api/referral/stats` — confirm response shape
- [ ] Backend API endpoint: `POST /api/referral/redeem` — confirm request/response
- [ ] PostHog API key: Provide for dev/staging/prod environments
- [ ] Referral discount amount: Confirm 1-month discount value
- [ ] Tour trigger delay: Should tour show automatically on dashboard load or require user interaction?
