# Tasks: Q1 Frontend Rework

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450-600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Stage 1) → PR 2 (Stage 2) → PR 3 (Stage 3) → PR 4 (Stage 4) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain (target: develop) |

Decision needed before apply: Resolved — feature-branch-chain accepted
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain (target: develop)
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Auth fix, count-up, duplicate title | PR 1 | Independent; base = main |
| 2 | Language dropdown + mobile navbar | PR 2 | Standalone component + styles |
| 3 | Currency service + component migrations | PR 3 | Touches 5+ files, ChartService |
| 4 | Analytics page + profile insights | PR 4 | Lazy route + moved insights panel |

## Phase 1: Foundation

- [x] 1.1 Create `core/services/currency.service.ts` — `CurrencyConfig` interface, signal, `format()` method
- [x] 1.2 Create `core/pipes/ft-currency.pipe.ts` wrapping `CurrencyService`
- [ ] 1.3 Move `InsightsPanelComponent` from `dashboard/components/` to `shared/components/insights-panel/`
- [ ] 1.4 Delete old `features/dashboard/components/insights-panel/`

## Phase 2: Auth + Navigation Fixes

- [x] 2.1 `auth.guard.ts` — JWT decode expiry check; use `authService.isAuthenticated()`
- [x] 2.2 `redirect-if-auth.guard.ts` — use `authService.isAuthenticated()` signal
- [x] 2.3 `auth.interceptor.ts` — call `clearTokens()` + `/login` on 401 refresh failure
- [x] 2.4 `topbar.component.ts` — suppress `pageTitle` when route matches `NAV_ITEMS` label
- [x] 2.5 `count-up.directive.ts` — quadratic easing, default 2500ms

## Phase 3: Language + Mobile Navbar

- [x] 3.1 Create `shared/components/language-dropdown/` — globe icon, ES/EN/FR dropdown
- [x] 3.2 `public-navbar` — replace text buttons with `<ft-language-dropdown>`
- [x] 3.3 `public-navbar.component.scss` — responsive collapse below 768px
- [x] 3.4 Add `<ft-language-dropdown>` to `topbar.component.html`

## Phase 4: Currency Migration

- [x] 4.1 `chart.service.ts` — inject `CurrencyService`; tooltips use captured config
- [x] 4.2 `stat-card.component.ts` — `formatValue()` uses `CurrencyService`
- [x] 4.3 `recent-activity.component.ts` — `formatAmount()` uses `CurrencyService`
- [x] 4.4 `transaction-row.component.ts` — amount display uses `CurrencyService`
- [x] 4.5 `categories.component.html` — replace `| currency:'USD'` with `ftCurrency` pipe

## Phase 5: Analytics Page

- [ ] 5.1 `app.routes.ts` — add lazy `/analytics` route; remove redirect
- [ ] 5.2 Create `analytics/pages/analytics.page.*` — AreaChart + DonutChart + summary

## Phase 6: Profile Insights

- [ ] 6.1 `profile.page.ts` — inject `FinanceService`, fetch user insights + stats
- [ ] 6.2 `profile.page.html` — add `<ft-insights-panel>` with account stats

## Phase 7: Tests

- [x] 7.1 Unit: `CurrencyService` — format, default config, signal reactivity
- [x] 7.2 Unit: Auth guards — valid/expired/no token
- [x] 7.3 Unit: `LanguageDropdown` — open/close, click-outside, selection
- [x] 7.4 Unit: `CountUpDirective` — quadratic easing, 2500ms default
- [ ] 7.5 Integration: `AuthInterceptor` — 401 triggers `clearTokens()`
- [x] 7.6 Unit: `TopbarComponent` — title suppressed on nav match
- [x] 7.7 Integration: `ChartService` — tooltip uses `CurrencyService`
