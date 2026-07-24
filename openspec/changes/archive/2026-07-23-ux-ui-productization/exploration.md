## Exploration: UX/UI Productization

### Current State

Finance Tracker Frontend is a production Angular 19+ app (standalone components, signals, OnPush change detection) with:

- **Auth**: Better Auth session-based (cookie), full `SubscriptionInfo` model with trial support (`active_trial`, `trial_expired`, `premium_active`, `premium_expired`, `no_trial`)
- **Tiers**: `free | premium | premium_plus`, with a full subscription page showing tier cards, annual/monthly toggle, trial start API (`POST /api/subscription/trial`)
- **Paywall**: Route-level guard (`premiumGuard`) + inline widget blur cards (AiInsightsCard, GoalsWidget). Dashboard shows blurred preview with "Activar Premium" CTA overlay.
- **Empty States**: Shared `EmptyStateComponent` used inconsistently — some pages use it, others have inline custom empty states. All are purely functional ("No data yet, start adding transactions").
- **Reusable Components**: Toast system, glass-panel, ui-card, ui-button (inconsistent adoption), confirm-dialog (glass), skeleton, subtle-reveal animations, echarts wrapper, command palette.

### Affected Areas

- `src/app/core/guards/premium.guard.ts` — current paywall, needs upgrade modal instead of toast redirect
- `src/app/core/services/auth.service.ts` — `isPremium`, `isTrialActive`, `subscriptionTier` signals — foundation for all paywall features
- `src/app/core/models/user.model.ts` — `SubscriptionInfo` model with trial dates — used for countdown
- `src/app/features/dashboard/pages/dashboard.page.ts` — dashboard top area where trial banner should live; imports `EmptyStateComponent`
- `src/app/features/dashboard/components/ai-insights-card/` — inline paywall pattern (blur + overlay + CTA) — upgrade to modal
- `src/app/features/dashboard/components/goals-widget/` — same inline paywall pattern
- `src/app/features/subscription/pages/subscription.page.ts` — has trial countdown display but ONLY on this page, not global
- `src/app/shared/components/empty-state.component.ts` — generic empty state, needs richer variants
- `src/app/shared/layout/topbar/` — no trial banner, no upgrade prompt
- `src/app/features/categories/`, `transactions/`, `goals/`, `pockets/`, `ai-insights/`, `analytics/` — all have empty states (some shared, some inline)
- `src/app/shared/ui/` — GlassPanel, UiButton, UiCard, UiBadge, SectionHeader, CategorySelect, Pagination, Toast
- `src/app/shared/components/` — EmptyState, Skeleton, ConfirmDialog, LanguageDropdown, InsightsPanel
- `src/app/shared/directives/` — HoverDepth, ClickOutside, FtSubtleReveal (animation), FtNumberFormat

### Approaches

1. **Incremental widget-level** — build each productization item as a standalone shared component, slot them into existing pages one at a time.
   - **Pros**: Low risk, each item can ship independently, no architectural changes needed
   - **Cons**: May result in inconsistent patterns if not designed together, no shared modal/banner system
   - **Effort**: Medium

2. **Shared primitives first** — build a generic modal system, banner component, tour engine, and tracking infrastructure BEFORE implementing the 7 items. Then all 7 use these primitives.
   - **Pros**: Consistent UX across all items, reusable infrastructure, avoids tech debt
   - **Cons**: Higher upfront investment, delays visible results
   - **Effort**: High

3. **Hybrid** — build shared infrastructure (modal, banner, tracking) in parallel with high-impact items (trial banner, onboarding, paywall modal). Referral and analytics tracking can come later.
   - **Pros**: Balanced approach, visible wins early, infrastructure reusable for remaining items
   - **Cons**: Requires coordination
   - **Effort**: Medium-High

### Recommendation

**Hybrid approach**. Build a reusable banner + modal system first (shared), then implement the 7 items in priority order:

1. **Trial countdown banner** — Most impactful, least effort. Reuse existing `trialStatus` logic from subscription page. Slot into topbar/dashboard.
2. **Paywall with upgrade modal** — Replace toast redirect in `premiumGuard` and inline widget overlays with a rich modal showing feature comparison (`TierComparisonRow` model already exists in `tier.model.ts`).
3. **Empty states with purpose** — Enhance `EmptyStateComponent` with variant support (default, premium-upsell, first-use, no-results) and contextual messaging.
4. **Onboarding flow** — Build tour engine using existing `FtSubtleRevealDirective` for highlight animation + step overlay.
5. **Upgrade prompts intelligence** — Make upgrade intercepts contextual (know which feature triggered the prompt, show relevant comparison).
6. **Analytics tracking** — Lightweight custom event bus + backend endpoint. Avoid heavy third-party SDKs initially.
7. **Referral system** — New page/component, needs backend support too (wait for backend).

### Risks

- **Button system fragmentation**: `UiButtonComponent` exists but `.btn-primary` CSS classes are still used in many places. New components should use `UiButtonComponent` exclusively to avoid adding to the problem.
- **No generic modal system**: Current modals are purpose-built (CategoryModal, inline modals in Goals/Pockets). Building a generic modal is prerequisite for upgrade modal, onboarding steps, and referral modals.
- **Translation debt**: Many strings are hardcoded Spanish in components (not in i18n JSON). New features should use the `TranslatePipe` for all user-facing strings.
- **Trial countdown relies on correct server data**: The `trialEnd` date comes from the auth session. Must handle edge cases (null trialEnd, expired trial, no subscription object).
- **Analytics tracking requires backend**: Even a lightweight approach needs a backend endpoint to receive and store events. Coordinate with backend team.
- **Referral needs backend**: Complete referral flow (invite link, tracking, discount application) requires backend implementation. Frontend can only build the UI/UX layer.

### Ready for Proposal
Yes — all 7 items are clearly scoped. Priority ordering above balances impact vs. effort. The missing infrastructure pieces (generic modal, banner component, tour engine) should be built as shared primitives in the first 2-3 items.
