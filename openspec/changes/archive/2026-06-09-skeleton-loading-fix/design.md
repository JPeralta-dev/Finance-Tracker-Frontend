# Design: Fix Skeleton Loading Animation on Dashboard Home

## Technical Approach

Complete the dashboard loading experience: (1) add stat-card footer skeleton, (2) show skeleton placeholders for all dashboard sections during loading, (3) add CSS cross-fade transition between loading and ready states, (4) deprecate the duplicate shimmer in `skeleton.component.ts` in favor of the shared `_skeleton.scss` animation.

All changes are CSS/template-only. No new dependencies, no Angular animation module.

## Architecture Decisions

### Decision: Shimmer animation source of truth

**Choice**: Single shimmer animation via `_skeleton.scss` `@keyframes shimmer` (opacity pulse)
**Alternatives considered**: Keep gradient sweep in `skeleton.component.ts`, use View Transitions API
**Rationale**: `skeleton.component.ts` reimplements the same `shimmer` name with a different effect (gradient sweep vs opacity pulse). Proposal explicitly calls for unifying to `_skeleton.scss` opacity pulse. The gradient sweep was likely a copy-paste artifact. The `skeleton.component.ts` component is a generic wrapper used nowhere in the dashboard loading flow (stats-grid uses direct template markup with `.stat-card--skeleton` classes), so removing its gradient sweep has zero impact.

### Decision: Cross-fade animation mechanism

**Choice**: CSS `@keyframes` opacity cross-fade with absolute-positioned skeleton overlay
**Alternatives considered**: Angular `@transition` / AnimationBuilder, View Transitions API
**Rationale**:
- Angular animations require extra imports and change detection cycles
- View Transitions API is page-level (not component-level) and already configured for route changes in `styles.scss` — using it here would be misuse
- CSS-only cross-fade is zero-cost, works with OnPush, no JS involvement
- Absolute positioning prevents layout shift during the 400ms transition

### Decision: Skeleton markup strategy

**Choice**: Reuse existing skeleton patterns already defined in each component's SCSS; compose skeleton containers in `dashboard.page.html` loading block
**Alternatives considered**: New dedicated `dashboard-skeleton.component`, use `app-skeleton` component everywhere
**Rationale**:
- `chart-placeholder` already has `loading` input and skeleton bars — use it directly
- `area-chart`, `donut-chart`, `recent-activity` already have `.chart-skeleton`, `.chart-skeleton`, `.activity-row--skeleton` classes defined
- Creating a new component or wrapping `app-skeleton` everywhere adds unnecessary indirection
- The loading block in `dashboard.page.html` simply shows/hides the same structural containers with skeleton classes

### Decision: Stat-card footer skeleton approach

**Choice**: Add `.stat-card__footer--skeleton` block to `_skeleton.scss`; add skeleton footer markup to `stats-grid.component.html` inside `.stat-card--skeleton`
**Alternatives considered**: Use `min-height` on stat-card skeleton to match real card height
**Rationale**: `min-height` is fragile — any real card footer content change breaks the skeleton. Explicit skeleton footer blocks (trend + insight placeholders) are self-documenting and dimension-accurate. Already follows the established pattern in `_skeleton.scss` for icon/label/value skeletons.

## Data Flow

```
dashboard.page.ts state() = 'loading'
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ dashboard.page.html  @if (state() === 'loading')        │
│   ├── .dashboard-greeting (skeleton title)              │
│   ├── ft-stats-grid [loading]="true"                   │
│   │     └── stat-card--skeleton + __footer--skeleton   │
│   ├── .dashboard-insights (skeleton panel)             │
│   ├── .dashboard-content__chart                        │
│   │     └── chart-placeholder [loading]="true"         │
│   ├── .dashboard-content__sidebar                      │
│   │     ├── ft-recent-activity [loading]="true"        │
│   │     └── ft-donut-chart [loading]="true"            │
└─────────────────────────────────────────────────────────┘
              │ 400ms cross-fade transition
              ▼
dashboard.page.ts state() = 'ready'
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ dashboard.page.html @else (state() === 'ready')         │
│   ├── .dashboard-greeting (real greeting)               │
│   ├── ft-stats-grid [loading]="false" + real stats     │
│   ├── .dashboard-insights (real insights)               │
│   ├── .dashboard-content (real chart + sidebar)         │
└─────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/styles/_skeleton.scss` | Modify | Add `.stat-card__footer--skeleton` block; ensure shared `@keyframes shimmer` is the only animation |
| `src/app/features/dashboard/components/stats-grid/stats-grid.component.html` | Modify | Add footer skeleton markup inside `.stat-card--skeleton` |
| `src/app/features/dashboard/pages/dashboard.page.html` | Modify | Extend loading block: add skeleton containers for insights, chart (via `chart-placeholder`), recent-activity, donut-chart |
| `src/app/features/dashboard/pages/dashboard.page.scss` | Modify | Add `.loading-overlay` + cross-fade keyframes; apply `.dashboard-page--loading` modifier |
| `src/app/shared/components/skeleton/skeleton.component.ts` | Modify | Remove inline `@keyframes shimmer` gradient sweep; rely on imported `_skeleton.scss` shimmer (or delete component if unused) |
| `src/app/shared/charts/area-chart/area-chart.component.ts` | Modify | Add `loading` input signal; expose skeleton when loading |
| `src/app/shared/charts/donut-chart/donut-chart.component.ts` | Modify | Add `loading` input signal; expose skeleton when loading |
| `src/app/features/dashboard/components/recent-activity/recent-activity.component.ts` | Modify | Add `loading` input signal; expose skeleton rows when loading |
| `src/app/shared/components/insights-panel/insights-panel.component.ts` | Modify | Add `loading` input signal; expose skeleton cards when loading |

## Interfaces / Contracts

### New Component Inputs

```typescript
// area-chart.component.ts, donut-chart.component.ts
@Input() loading = false;

// recent-activity.component.ts
@Input() loading = false;

// insights-panel.component.ts
@Input() loading = false;
```

### Skeleton CSS Classes (already exist, reused)

```scss
// In each component's .scss:
.stat-card--skeleton { /* pointer-events: none */ }
.stat-card__footer--skeleton { /* NEW: ~30px placeholder */ }
.chart-skeleton { /* bar chart skeleton */ }
.chart-skeleton__donut { /* donut skeleton */ }
.activity-row--skeleton { /* activity row skeleton */ }
```

### Cross-fade Animation Token Usage

```scss
// Uses existing tokens from styles.scss:
animation: skeleton-fade-out var(--duration-slow) var(--ease-out) forwards;
animation: content-fade-in var(--duration-slow) var(--ease-out) forwards;
// --duration-slow: 400ms, --ease-out: cubic-bezier(0.16, 1, 0.3, 1)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Skeleton SCSS classes render at correct dimensions | Snapshot test: verify computed heights match spec (footer ~30px) |
| Unit | `loading` input on chart/activity/insights components | Component test: set `loading=true`, query skeleton elements present |
| Integration | Full loading→ready transition | Test `state()` signal changes, CSS cross-fade applies, no layout shift |
| E2E | Visual loading experience | Playwright: verify all sections visible during loading, cross-fade occurs |

## Migration / Rollout

No migration required. All changes are additive:
- Stat card skeleton gains footer (visual improvement only)
- Loading block expands to show more skeletons (visual improvement only)
- Cross-fade adds animation (enhancement, falls back to instant swap on `prefers-reduced-motion`)
- Shimmer unification: `skeleton.component.ts` loses its private keyframe (no behavioral change if component is unused in dashboard flow)

## Open Questions

- [ ] Verify `skeleton.component.ts` (`app-skeleton`) is not used anywhere in the dashboard loading flow before removing its gradient shimmer — if used elsewhere, the gradient sweep may be intentional and should be preserved as a separate named animation
- [ ] Confirm whether `ftSubtleReveal` directive should handle the loading→ready cross-fade (as a "fade-up" effect with delay) or if pure CSS overlay is preferred — current design uses CSS overlay to avoid Angular CD complexity