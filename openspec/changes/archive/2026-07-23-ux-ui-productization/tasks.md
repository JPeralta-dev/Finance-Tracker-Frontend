# Tasks: UX/UI Productization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1800–2300 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Engagement) → PR 3 (Referral) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

**Reasoning**: 7 commits across 15+ new files and 5+ modified files. Individual commits range 150–500 lines each, but total diff far exceeds 400. Safe review requires splitting into at least 3 chained PRs. Chain strategy left `pending` — needs team decision.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Foundation: Analytics + Modal + Banner | PR 1 | `ng test --include='**/analytics*' --include='**/modal*' --include='**/announcement-banner*'` | `ng serve`, check modal opens on `/goals` free access | `git revert HEAD~3` — 3 commits (analytics, modal, banner) |
| 2 | Engagement: Paywall + Tour + Empty States + Prompts + Trial Banner | PR 2 | `ng test --include='**/*upgrade*' --include='**/*tour*' --include='**/*empty-state*' --include='**/*trial*'` | Create free account, verify tour triggers on dashboard, paywall blocks premium routes | `git revert HEAD~5` — 5 commits |
| 3 | Referral: service + page + widget + route | PR 3 | `ng test --include='**/*referral*'` | Visit `/referral`, verify link generation and share buttons | `git revert HEAD~1` — remove referral files + route |

## Implementation Commits

### Order: 1 / Dependency: none
- [ ] **PostHog analytics integration**
  - **Files**: Create `src/app/shared/services/analytics.service.ts`, `src/app/shared/services/analytics.config.ts`; Modify `src/environments/environment.ts`, `src/environments/environment.prod.ts` (add `posthogKey`)
  - **Dependencies**: None (standalone service)
  - **Verification**: `analytics.service.spec.ts` — mock PostHog, verify `trackEvent()`, `identifyUser()`, event batching, consent flow, offline queue
  - **Est. lines**: 250

### Order: 2 / Dependency: 1 (uses analytics)
- [ ] **Paywall modal with feature comparison**
  - **Files**: Create `src/app/shared/ui/modal/modal.component.ts`, `modal.component.html`, `modal.component.scss`; Create `src/app/features/upgrade/upgrade-modal.component.ts`, `.html`, `.scss`; Create `src/app/shared/models/tier-comparison.ts`; Modify `src/app/core/guards/premium.guard.ts` (show modal instead of redirect); Add i18n keys in `es.json`, `en.json`
  - **Dependencies**: #1 (analytics events), auth service (existing)
  - **Verification**: Modal opens/closes with focus trap, ESC/backdrop close, responsive sizes — guard opens upgrade modal for free users on `/goals`, premium users pass through — `paywall_modal_shown` event tracked
  - **Est. lines**: 320

### Order: 3 / Dependency: 1 (uses analytics)
- [ ] **Trial countdown banner**
  - **Files**: Create `src/app/shared/components/announcement-banner.component.ts`, `.html`, `.scss`; Create `src/app/shared/components/trial-banner.component.ts`, `.html`, `.scss`; Add i18n keys
  - **Dependencies**: #1 (analytics for dismiss/CTA events)
  - **Verification**: Banner shows trial countdown with correct urgency styling (info → warning → error), dismiss persists 24h, CTA navigates to `/subscription`, `trial_banner_dismissed` tracked
  - **Est. lines**: 250

### Order: 4 / Dependency: 1 (uses analytics)
- [ ] **Onboarding tour (5 steps, skippable)**
  - **Files**: Create `src/app/shared/services/tour.service.ts`, `src/app/shared/models/tour.types.ts`; Create `src/app/shared/components/tour/tour-overlay.component.ts`, `.html`, `.scss`; Create `src/app/shared/components/tour/tour-tooltip.component.ts`, `.html`, `.scss`; Add i18n keys for 5 steps
  - **Dependencies**: #1 (analytics for step/skip/complete events)
  - **Verification**: Tour starts at step 1, navigates next/prev/ESC skip, persists state in localStorage, resumes from last step, triggers for new users on dashboard, 5 step tooltips appear on correct targets, `onboarding_tour_completed` tracked
  - **Est. lines**: 450

### Order: 5 / Dependency: none (modifies existing component)
- [ ] **Enhanced empty states with premium variants**
  - **Files**: Modify `src/app/shared/components/empty-state.component.ts` (add `variant`, `secondaryText`, `secondaryAction` inputs); Add i18n keys for premium-upsell and first-use variants
  - **Dependencies**: None (backward-compatible extension)
  - **Verification**: `variant="default"` renders identical behavior; `variant="premium-upsell"` shows premium messaging + CTA; `variant="first-use"` shows guided setup — CTA actions fire correctly
  - **Est. lines**: 180

### Order: 6 / Dependency: 1+2+3+5 (wire into dashboard)
- [ ] **Contextual upgrade prompts**
  - **Files**: Create `src/app/shared/components/upgrade-prompt.component.ts`, `.html`, `.scss`; Create `src/app/shared/directives/premium-action.directive.ts`; Modify `src/app/features/dashboard/pages/dashboard.page.ts` and `.html` (integrate trial banner Row 0, upgrade prompts in rows 3-4, enhanced empty states); Add i18n keys
  - **Dependencies**: #1 (analytics), #2 (upgrade modal is fallback), #3 (trial banner on dashboard), #5 (enhanced empty states in widgets)
  - **Verification**: Free user sees upgrade prompt + premium-upsell empty state on AI Insights card; premium user sees actual content; `upgrade_prompt_clicked` tracked; trial banner shows in Row 0; dashboard renders 6 rows correctly
  - **Est. lines**: 350

### Order: 7 / Dependency: 1 (uses analytics)
- [ ] **Referral system (unique links, 1-month discount)**
  - **Files**: Create `src/app/features/referral/referral.service.ts`, `referral-page.component.ts`, `.html`, `.scss`, `referral-widget.component.ts`, `.html`, `.scss`; Create `src/app/features/referral/referral.models.ts`; Create `src/app/shared/components/referral-code-input.component.ts` (for subscription page); Modify `src/app/app.routes.ts` (add `/referral` route); Add i18n keys
  - **Dependencies**: #1 (analytics for referral events)
  - **Verification**: `/referral` page shows unique 8-char link, copy-to-clipboard works, share buttons open correct apps, referrer stats display, `referral_link_generated` event tracked
  - **Est. lines**: 500

## Summary

| | Item | Files | Est. Lines | Depends On |
|---|------|-------|-----------|------------|
| 1 | PostHog analytics | 3 new, 2 mod | 250 | — |
| 2 | Paywall modal | 7 new, 1 mod | 320 | #1 |
| 3 | Trial countdown banner | 6 new | 250 | #1 |
| 4 | Onboarding tour | 8 new | 450 | #1 |
| 5 | Enhanced empty states | 1 mod | 180 | — |
| 6 | Contextual upgrade prompts | 3 new, 2 mod | 350 | #1, #2, #3, #5 |
| 7 | Referral system | 8 new, 1 mod | 500 | #1 |
| | **Total** | **35 new, 7 mod** | **2300** | |
