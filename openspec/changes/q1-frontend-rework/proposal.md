# Proposal: Q1 Frontend Rework

## Intent

Fix auth redirect loop for expired tokens, centralize hardcoded currency, build analytics page, add profile insights, and polish UI.

## Scope

### In Scope
- Auth guard: validate token expiry
- Currency service: replace hardcoded USD in 5+ files
- Analytics page with charts
- Profile insights panel + user stats
- Language selector: globe icon + dropdown
- Fix duplicate topbar title
- Gentler count-up animation
- Responsive mobile navbar

### Out of Scope
- Backend API changes, Chart.js migration, E2E tests, dark mode

## Capabilities

### New Capabilities
- `analytics`: Page with charts and spending trends
- `user-insights`: Profile panel with user stats

### Modified Capabilities
- `auth`: Guard validates expiry; expired → login
- `currency`: Centralized service replaces hardcoded USD
- `i18n`: Dropdown replaces text buttons
- `navigation`: Eliminate duplicate topbar titles
- `dashboard`: Adjust count-up animation
- `landing`: Responsive mobile navbar

## Approach

Four stages: (1) Auth fix + quick wins. (2) Language dropdown + mobile navbar. (3) Currency service. (4) Profile insights + analytics.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/core/guards/auth.guard.ts` | Modified | Token expiry check |
| `src/app/core/guards/redirect-if-auth.guard.ts` | Modified | Valid-token redirect |
| `src/app/core/services/currency.service.ts` | New | Currency config |
| `src/app/features/categories/` | Modified | Use currency service |
| `src/app/features/dashboard/components/stat-card/` | Modified | Use currency service |
| `src/app/features/dashboard/components/recent-activity/` | Modified | Use currency service |
| `src/app/features/dashboard/components/transaction-row/` | Modified | Use currency service |
| `src/app/features/dashboard/dashboard.component.ts` | Modified | Animation params |
| `src/app/features/analytics/` | New | Analytics page |
| `src/app/features/profile/` | Modified | Insights panel |
| `src/app/shared/layout/topbar/` | Modified | Title fix, dropdown |
| `src/app/shared/layout/navbar/` | Modified | Mobile responsive |
| `src/app/shared/layout/public-navbar/` | Modified | Globe dropdown |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth guard breaks login | Medium | Test all auth paths |
| Currency breaks tooltips | Medium | Preserve formatter |
| Analytics exceeds backend | Low | Client-side fallback |

## Rollback Plan

Revert auth guards, remove currency service, restore text buttons, delete analytics folder, revert profile. No migrations needed.

## Dependencies

- Backend analytics endpoints (fallback: client-side aggregation)

## Success Criteria

- [ ] Expired tokens access public routes
- [ ] No duplicate topbar titles
- [ ] Gentle count-up animation
- [ ] Language dropdown everywhere
- [ ] Single currency service
- [ ] Analytics page renders
- [ ] Profile shows insights
- [ ] Mobile navbar works
