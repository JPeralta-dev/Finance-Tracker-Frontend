# Proposal: UX/UI Productization

## Intent

Convert free users to paying customers through purposeful UX demonstrating premium value, guiding onboarding, creating viral growth loops. Current paywall lacks rich messaging, trial visibility limited, empty states don't sell features, no conversion analytics.

## Scope

### In Scope
- Paywall modal with feature comparison
- Skippable onboarding tour (4-5 steps)
- Enhanced empty states with premium variants
- Persistent trial countdown banner
- Contextual upgrade prompts
- PostHog analytics integration
- Referral system (unique links, 1-month discount)

### Out of Scope
- Backend API implementation
- Payment/billing changes
- Breaking subscription page changes

## Capabilities

### New Capabilities
- `paywall-modal`: Upgrade modal with tier comparison
- `onboarding-flow`: Tour engine with step highlighting
- `trial-banner`: Persistent countdown
- `upgrade-prompts`: Contextual intercepts
- `analytics-tracking`: PostHog integration
- `referral-system`: Invite links, discount UI

### Modified Capabilities
- `empty-states`: Variant support (premium-upsell, first-use)
- `dashboard`: Trial banner, enhanced empty states

## Approach

Build shared primitives first (modal, banner, tour), then 7 features in priority order. Each feature = separate commit. Reuse `TierComparisonRow`, `EmptyStateComponent`, `ConfirmDialogComponent`, `FtSubtleRevealDirective`.

Priority: (1) trial banner, (2) paywall modal, (3) empty states, (4) onboarding, (5) upgrade prompts, (6) PostHog, (7) referral.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/shared/components/` | New | Modal, banner, tour engine |
| `src/app/core/guards/premium.guard.ts` | Modified | Modal trigger |
| `src/app/features/dashboard/` | Modified | Trial banner, empty states |
| `src/app/features/dashboard/components/ai-insights-card/` | Modified | Modal trigger |
| `src/app/features/dashboard/components/goals-widget/` | Modified | Modal trigger |
| `src/app/shared/components/empty-state.component.ts` | Modified | Variants |
| `src/app/shared/layout/topbar/` | Modified | Trial banner |
| `src/app/features/referral/` | New | Referral page/components |
| `src/app/core/services/` | New | Analytics, referral services |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| No generic modal | High | Build reusable modal first |
| Button fragmentation | Medium | Enforce UiButtonComponent |
| Translation debt | Medium | Use TranslatePipe |
| Trial data edge cases | Medium | Handle null/expired |
| Referral needs backend | High | Build UI first |

## Rollback Plan

All additive. Each feature = separate commit. Shared components have no dependencies. Paywall reverts to blur. Banner removal safe. Analytics opt-in. Referral isolated.

## Dependencies

- PostHog account/API key
- Backend API for referral
- Backend analytics endpoint (if not PostHog)
- `TierComparisonRow` model (available)

## Success Criteria

- [ ] Paywall modal shows on premium access (tracked)
- [ ] Onboarding completion > 60%
- [ ] Trial banner increases subscription visits 30%
- [ ] Premium empty states increase upgrade engagement 25%
- [ ] PostHog captures 100% premium events
- [ ] Referral generates 10+ invites first week
- [ ] All components use TranslatePipe
- [ ] Zero breaking changes
