# Proposal: Frontend UX Polish

## Intent

Fix three small, well-understood visual UX issues in the Finance Tracker frontend: KPI cards leaving white space on wide screens, chart tooltips overflowing at edges with untranslated day names, and the landing footer blending into the page background. These are cosmetic fixes — zero logic changes.

## Scope

### In Scope
- KPI cards grid: fixed column counts (4 → 2 → 1) replacing `auto-fill`
- Chart tooltip: add `confine: true` to all ECharts tooltip configs
- Day name i18n: translate `Mon`–`Sun` labels on the frontend for en/es/fr
- Landing footer: distinct background, stronger border-top, full-bleed section feel

### Out of Scope
- Backend day name changes (server sends English labels — we translate on the client)
- Responsive overhaul (covered by `frontend-ux-responsive-overhaul`)
- Any other analytics, i18n, or landing changes

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `analytics`: Tooltip confinement behavior (overflow fix), KPI grid layout at desktop/tablet, daily chart xAxis labels use translated day names
- `i18n`: New translation keys for weekday abbreviations (`analytics.days.mon`–`.sun`) across en/es/fr
- `landing`: Footer visual distinction — background, border, full-width section treatment

## Approach

1. **KPI grid**: Replace `repeat(auto-fill, minmax(220px, 1fr))` with breakpoint-based fixed columns in `analytics-kpis.component.scss`
2. **Tooltip**: Add `confine: true` to `buildBarOption()`, `buildAreaOption()`, and `buildDonutOption()` in `echarts-theme.mapper.ts`
3. **Day names**: Add `analytics.days.*` keys to all three i18n JSON files; inject `TranslationService` in `analytics.page.ts` to map `daily.days[].label` before passing to `buildBarOption()`
4. **Footer**: Update `footer.component.scss` with `--bg-secondary` background and stronger `border-top`; ensure full-bleed via landing container

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `features/analytics/components/analytics-kpis/analytics-kpis.component.scss` | Modified | Grid `grid-template-columns` breakpoints |
| `shared/charts/echarts/echarts-theme.mapper.ts` | Modified | `confine: true` on 3 tooltip configs |
| `features/analytics/pages/analytics.page.ts` | Modified | Translate day labels via `TranslationService` |
| `assets/i18n/en.json` | Modified | Add `analytics.days.*` keys |
| `assets/i18n/es.json` | Modified | Add `analytics.days.*` keys |
| `assets/i18n/fr.json` | Modified | Add `analytics.days.*` keys |
| `features/landing/components/footer/footer.component.scss` | Modified | Background, border, full-width styling |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `confine: true` clips tooltips on very narrow charts | Low | Test on mobile (320px) and narrow sidebar layouts |
| Day name keys missing in one locale | Low | Add to all 3 files simultaneously; verify with build |
| KPI grid breaks on edge breakpoints | Low | Verify at 768px, 1024px, 1440px |

## Rollback Plan

All changes are reversible CSS/i18n/config edits:
- Revert `analytics-kpis.component.scss` to `auto-fill` grid
- Remove `confine: true` from mapper tooltip configs
- Remove `analytics.days.*` keys from i18n files and revert `analytics.page.ts` translation logic
- Revert footer SCSS to previous styling

No database, API, or migration changes — clean `git revert` is sufficient.

## Dependencies

- None — all work is self-contained in the frontend

## Success Criteria

- [ ] KPI cards fill the full horizontal width at desktop (4 columns), tablet (2 columns), mobile (1 column) with no white space gaps
- [ ] Chart tooltips at left/right edges render fully inside the chart container (not clipped by `overflow: hidden`)
- [ ] Daily chart xAxis labels display in the active locale (Mon→Lun→Lun for es/fr)
- [ ] Landing footer has visually distinct background and clear separation from content above
- [ ] `ng build --configuration production` succeeds with zero errors
- [ ] `ng test --no-watch --browsers=ChromeHeadless` passes all existing tests
