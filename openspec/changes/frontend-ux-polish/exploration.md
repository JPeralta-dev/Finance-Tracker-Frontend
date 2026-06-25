# Exploration: Frontend UX Polish

## Issue 1 — Analyst KPI Cards Not Filling Horizontal Space

### Current State
- `analytics-kpis.component.scss` uses `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`
- With 4 KPI cards, `auto-fill` can leave empty tracks on the right when cards don't distribute evenly
- Dashboard home stats use `repeat(2, 1fr)` at ≥768px — fixed columns, no gaps, stretch to fill

### Root Cause
`auto-fill` with `minmax(220px, 1fr)` creates as many 220px+ columns as fit. On wide screens, 4 cards in a row leaves unused space because `auto-fill` doesn't force items to stretch when there are fewer items than columns.

### Affected Files
- `src/app/features/analytics/components/analytics-kpis/analytics-kpis.component.scss` — grid definition
- `src/app/features/dashboard/pages/dashboard.page.scss` — reference: `.stats-grid--2col` uses fixed `repeat(2, 1fr)`

### Recommended Approach
Change KPI grid to fixed column counts:
- Desktop (≥1024px): `repeat(4, 1fr)` 
- Tablet (≥768px): `repeat(2, 1fr)`
- Mobile: `1fr`

### Effort: Low (~10 lines SCSS)

---

## Issue 2 — Weekly Chart: Tooltip Overflow + No i18n for Day Names

### Current State (2a — Tooltip Overflow)
- `echarts-theme.mapper.ts` `buildBarOption()` (line 287-294) defines tooltip with `trigger: 'axis'` but **no `confine: true`**
- Without `confine`, ECharts tooltips overflow the container — edges (Monday left, Sunday right) get cut off
- `ft-echart.component.ts` `.ft-echart-container` has `overflow: hidden` (line 88), clipping tooltips at container boundary

### Current State (2b — Day Name Translation)
- Backend `get-daily-spending.use-case.ts` (line 5): `const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`
- These English abbreviations flow through API → `daily.days[].label` → `dailyChartOptions()` → `buildBarOption()` → xAxis labels
- No translation layer exists. No i18n keys for day names in `es.json` or `en.json`

### Root Causes
- **Tooltip**: Missing `confine: true` in ECharts tooltip config — documented ECharts option that constrains tooltip to chart container
- **Translation**: Day labels are generated server-side in English and passed through without frontend i18n

### Affected Files
- `src/app/shared/charts/echarts/echarts-theme.mapper.ts` — `buildBarOption()` and `buildAreaOption()` tooltip configs
- `src/app/features/analytics/pages/analytics.page.ts` — `dailyChartOptions()` computed (line 390-399)
- `src/assets/i18n/es.json` — missing day name keys
- `src/assets/i18n/en.json` — missing day name keys

### Recommended Approach
1. **Tooltip fix**: Add `confine: true` to all tooltip configs in `echarts-theme.mapper.ts` (`buildBarOption`, `buildAreaOption`, `buildDonutOption`)
2. **Translation fix**: Add day name keys to i18n files (`analytics.days.mon`, `.tue`, `.wed`, `.thu`, `.fri`, `.sat`, `.sun`), then translate labels in `dailyChartOptions()` using `TranslationService` before passing to `buildBarOption()`

### Effort: Moderate (~30 lines code + i18n keys)

---

## Issue 3 — Landing Footer Full-Width Section

### Current State
- `<ft-footer />` is a direct child of `<div class="landing">` (line 57 of `landing.component.html`)
- `.footer` has `padding: 64px 0 24px; background: var(--bg-primary); border-top: 1px solid var(--glass-border)`
- `.footer__inner` has `max-width: var(--content-max-width); margin: 0 auto; padding: 0 24px`
- The section above (`.final-cta-wrapper`) has `padding: 80px 24px` with no bottom border/separator
- Background matches page background → footer blends visually

### Root Cause
Footer lacks visual distinction: same background as page, no wrapper section, and the border-top is subtle (glass-border). The `.landing` container has `overflow-x: hidden` but that's not the main issue — the footer needs to feel like a standalone full-bleed section with distinct visual treatment.

### Affected Files
- `src/app/features/landing/landing.component.html` — footer placement (line 57)
- `src/app/features/landing/components/footer/footer.component.scss` — footer styling
- `src/app/features/landing/landing.component.scss` — landing container

### Recommended Approach
Give footer a distinct background (e.g., `var(--bg-secondary)` or a darker shade), increase top border visibility, and ensure the footer takes full viewport width with edge-to-edge background. Optionally, wrap it in a `<section>` with specific styling.

### Effort: Low (~15 lines SCSS)

---

## Summary

| Issue | Files | Est. Lines | Type |
|-------|-------|-----------|------|
| KPI Cards grid | 1 SCSS | ~10 | CSS grid fix |
| Chart tooltip + i18n | 1 TS (mapper) + 1 TS (page) + 2 JSON (i18n) | ~40 | Config + i18n |
| Landing footer | 1 SCSS (footer) + 1 SCSS (landing) | ~15 | CSS styling |
| **Total** | **~6 files** | **~65 lines** | |

## Risks
- **Low risk overall**: All changes are CSS/i18n/config, no logic changes
- Chart tooltip `confine: true` may clip tooltips slightly inside the container — test on mobile and narrow charts
- Day name translation: ensure all locales (en, es, fr) have the new keys
- KPI grid change: verify on all breakpoints (320px through 1440px)

## Ready for Proposal
Yes — all issues are well-understood, scoped, and have clear fixes.
