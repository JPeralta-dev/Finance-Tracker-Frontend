# Proposal: Fix Skeleton Loading Animation on Dashboard Home

## Intent

The dashboard skeleton loading is incomplete and jarring — only stats grid shows during loading, stat card skeletons are missing footer sections (~30px shorter than real cards), the loading→ready transition is instant (no animation), and two conflicting shimmer implementations exist. This creates a poor perceived performance experience.

## Scope

### In Scope
- Fix stat card skeleton to include footer section (trend + insight) matching real card height
- Show all skeleton sections during loading: charts, activity list, donut chart, insights panel
- Add cross-fade animation for loading→ready state transition using existing `--ease-out` / `--duration-normal` tokens
- Unify shimmer animation to single implementation (prefer `_skeleton.scss` opacity pulse, remove gradient sweep from `skeleton.component.ts`)

### Out of Scope
- New loading states for other pages
- View Transitions API integration (future enhancement)
- Performance optimization of data fetching

## Capabilities

> This section is the CONTRACT between proposal and specs phases.

### New Capabilities
- `skeleton-loading`: Unified skeleton loading system covering all dashboard sections with consistent shimmer animation and smooth state transitions

### Modified Capabilities
- None

## Approach

1. **Skeleton completeness**: Add footer skeleton to `stat-card.component.scss` matching real card dimensions
2. **Full page coverage**: Extend `dashboard.page.html` loading block to include skeleton placeholders for charts, activity, donut, and insights panels
3. **Transition animation**: Add CSS cross-fade (`opacity` + `transform`) between loading/ready states using existing easing tokens
4. **Shimmer unification**: Remove inline gradient sweep from `skeleton.component.ts`, rely solely on `_skeleton.scss` opacity pulse

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/features/dashboard/pages/dashboard.page.html` | Modified | Add skeleton sections for charts, activity, donut, insights |
| `src/app/features/dashboard/pages/dashboard.page.scss` | Modified | Add cross-fade transition styles |
| `src/app/features/dashboard/components/stat-card/stat-card.component.scss` | Modified | Add footer skeleton dimensions |
| `src/app/features/dashboard/components/stats-grid/stats-grid.component.html` | Modified | Align skeleton with real card structure |
| `src/app/shared/charts/area-chart/area-chart.component.scss` | Modified | Add skeleton placeholder styles |
| `src/app/shared/charts/donut-chart/donut-chart.component.scss` | Modified | Add skeleton placeholder styles |
| `src/app/features/dashboard/components/recent-activity/recent-activity.component.scss` | Modified | Add skeleton placeholder styles |
| `src/app/shared/components/insights-panel/insights-panel.component.scss` | Modified | Add skeleton placeholder styles |
| `src/app/shared/components/skeleton/skeleton.component.ts` | Modified | Remove gradient sweep, use shared animation |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Skeleton dimensions don't match real cards exactly | Medium | Use CSS `min-height` matching real card computed height |
| Cross-fade causes layout shift | Low | Use absolute positioning overlay during transition |
| Removing gradient sweep breaks other consumers | Low | Audit `skeleton.component.ts` usage before removal |

## Rollback Plan

Revert the commit — all changes are CSS/template-only with no data layer modifications. The loading state logic remains unchanged; only visual presentation is affected.

## Dependencies

- Existing `_skeleton.scss` shared animation (already present)
- Existing CSS custom property tokens for easing/duration (already present)

## Success Criteria

- [ ] All dashboard sections show skeleton during loading (stats, charts, activity, donut, insights)
- [ ] Stat card skeleton height matches real card height including footer
- [ ] Loading→ready transition has visible cross-fade animation (not instant swap)
- [ ] Single shimmer animation source (no duplicate implementations)
- [ ] No visual layout shift during state transition
