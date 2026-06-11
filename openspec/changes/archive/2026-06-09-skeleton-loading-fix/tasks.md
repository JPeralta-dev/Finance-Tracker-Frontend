# Tasks: Fix Skeleton Loading Animation on Dashboard Home

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~140-160 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk (default) |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Shared Skeleton Foundation

- [x] 1.1 Add `.stat-card__footer--skeleton` block to `src/styles/_skeleton.scss` with trend (~60×20px) and insight (~80×14px) skeleton placeholders, matching real card footer dimensions at both breakpoints
- [x] 1.2 Audit `src/app/shared/components/skeleton.component.ts` usage in dashboard; if unused, remove gradient-sweep `@keyframes shimmer` and inline `.shimmer` styles (the shared `_skeleton.scss` animation replaces it)

## Phase 2: Component Loading States

- [x] 2.1 Add `@Input() loading = false` to `src/app/shared/components/insights-panel/insights-panel.component.ts`
- [x] 2.2 Add `@if (loading)` skeleton block to `src/app/shared/components/insights-panel/insights-panel.component.html` with 3 placeholder insight cards (icon + title + message skeleton bars)
- [x] 2.3 Add `.insight-card--skeleton` styles to `src/app/shared/components/insights-panel/insights-panel.component.scss` with shimmer animation from `_skeleton.scss`
- [x] 2.4 Remove duplicate `@keyframes shimmer` from `src/app/features/dashboard/components/chart-placeholder/chart-placeholder.component.scss` (shared animation already globally available via `styles.scss`)

## Phase 3: Dashboard Integration & Cross-Fade

- [x] 3.1 Add footer skeleton markup to `src/app/features/dashboard/components/stats-grid/stats-grid.component.html` inside `.stat-card--skeleton`: trend placeholder + insight placeholder using `.stat-card__footer--skeleton` classes
- [x] 3.2 Extend `src/app/features/dashboard/pages/dashboard.page.html` loading block: add skeleton containers for insights panel (`ft-insights-panel [loading]="true"`), area chart (`ft-chart-placeholder [loading]="true"` or chart skeleton), recent activity (`ft-recent-activity [loading]="true"`), and donut chart skeleton
- [x] 3.3 Add CSS cross-fade transition to `src/app/features/dashboard/pages/dashboard.page.scss`: absolute-positioned `.loading-overlay` with `@keyframes skeleton-fade-out` (opacity 1→0, `--duration-slow` 400ms, `--ease-out`), and `@keyframes content-fade-in` for real content; preserve `ftSubtleReveal` animation timing

## Phase 4: Testing

- [x] 4.1 Unit test: verify `.stat-card__footer--skeleton` renders trend+insight placeholders at correct dimensions when `loading=true` on stats grid
- [x] 4.2 Unit test: verify insights panel renders 3 skeleton cards when `loading=true`, real insights when `loading=false`
- [ ] 4.3 Integration test: verify `state()` transition from loading→ready triggers cross-fade overlay; verify no layout shift during animation
- [ ] 4.4 Verify `ftSubtleReveal="fade-up"` animations still fire on greeting, stats, and content sections after cross-fade completes (preserve 100/150/200/300ms delays)
