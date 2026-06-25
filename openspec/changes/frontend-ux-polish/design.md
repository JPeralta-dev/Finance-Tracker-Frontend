# Design: Frontend UX Polish

## Technical Approach

Three small CSS/i18n cosmetic fixes targeting the analytics KPI grid, chart tooltips, and landing footer. No logic changes — pure presentation layer updates following existing Angular/SCSS patterns.

## Architecture Decisions

### Decision: Fixed columns vs `auto-fill` for KPI grid

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `auto-fill, minmax(220px, 1fr)` | Leaves unused tracks on wide screens with few items | ❌ Rejected — causes white space |
| Fixed breakpoints (`repeat(4/2/1, 1fr)`) | Items always stretch to fill available width | ✅ Adopted — matches dashboard pattern |

**Rationale**: `auto-fill` creates as many columns as fit but doesn't force items to stretch when count < column count. With 4 KPIs on desktop, the existing grid left gaps. The dashboard's `.stats-grid--2col` pattern (line 64-72 of `dashboard.page.scss`) uses exactly this approach with `@media (min-width: 768px)`.

### Decision: `confine: true` on all tooltip configs, not just bar

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add only to `buildBarOption()` | Minimal change | ❌ Rejected — area/donut have same overflow risk |
| Add to all three builders (`bar`, `area`, `donut`) | Consistent behavior across all chart types | ✅ Adopted — same ECharts container clips all tooltips |

**Rationale**: The `.ft-echart-container` has `overflow: hidden` which clips all chart tooltips equally. Adding `confine: true` only to bar would leave area and donut tooltips broken. Consistency across chart types is the right call.

### Decision: Translate day names on frontend vs changing backend

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Change backend to send locale-specific labels | Requires API versioning, migration | ❌ Rejected — backend owns data, not i18n |
| Translate on frontend via `TranslationService` | Thin translation layer, follows existing pattern | ✅ Adopted — already used in `mapToKpis`, `mapToCategoryAnalysis` |

**Rationale**: The backend sends English abbreviations (`Mon`–`Sun`). Frontend already translates category names and labels via `TranslationService`. Adding a `DAY_KEY_MAP` constant and translating in `dailyChartOptions()` is the established pattern.

### Decision: `--bg-secondary` for footer background vs new CSS variable

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Create new variable like `--footer-bg` | More design tokens, adds complexity | ❌ Rejected — over-engineering a cosmetic fix |
| Reuse `--bg-secondary` | Already exists, provides sufficient contrast from `--bg-primary` | ✅ Adopted — footer already uses `--bg-primary`; `--bg-secondary` gives distinct tone |

**Rationale**: The footer currently uses `--bg-primary` which matches the page background, causing visual blending. `--bg-secondary` is already defined and used in the design system (e.g., status badges, form inputs) — reusing it follows DRY and maintains design token consistency.

## Data Flow

```
Backend API                    Angular Component              ECharts Theme Mapper
─────────────────────          ──────────────────────         ──────────────────────
daily.days[].label            dailyChartOptions()            buildBarOption()
  "Mon" ──────────────────▶ DAY_KEY_MAP ───────────────▶ labels[] ──────────▶ xAxis.data
                              "analytics.days.mon"
                                   │
                                   ▼
                          TranslationService
                                   │
                                   ▼
                              "Lun" (ES) / "Mon" (EN) / "Lun" (FR)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/features/analytics/components/analytics-kpis/analytics-kpis.component.scss` | Modify | Replace `auto-fill` with fixed breakpoints |
| `src/app/shared/charts/echarts/echarts-theme.mapper.ts` | Modify | Add `confine: true` to 3 tooltip configs |
| `src/app/features/analytics/pages/analytics.page.ts` | Modify | Translate day labels via `DAY_KEY_MAP` |
| `src/assets/i18n/en.json` | Modify | Add `analytics.days.mon`–`.sun` keys |
| `src/assets/i18n/es.json` | Modify | Add `analytics.days.mon`–`.sun` keys |
| `src/assets/i18n/fr.json` | Modify | Add `analytics.days.mon`–`.sun` keys |
| `src/app/features/landing/components/footer/footer.component.scss` | Modify | `--bg-secondary` background, stronger `border-top` |

## Interfaces / Contracts

### i18n Keys (all 3 locale files)

```json
"analytics": {
  "days": {
    "mon": "Mon",   // EN
    "tue": "Tue",   // EN
    "wed": "Wed",
    "thu": "Thu",
    "fri": "Fri",
    "sat": "Sat",
    "sun": "Sun"
  }
}
```

ES: `mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom"`
FR: `mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim"`

### `DAY_KEY_MAP` constant (TypeScript)

```typescript
const DAY_KEY_MAP: Record<string, string> = {
  Mon: 'analytics.days.mon',
  Tue: 'analytics.days.tue',
  Wed: 'analytics.days.wed',
  Thu: 'analytics.days.thu',
  Fri: 'analytics.days.fri',
  Sat: 'analytics.days.sat',
  Sun: 'analytics.days.sun',
};
```

### CSS Grid Breakpoints

```scss
// Desktop ≥1024px: 4 columns
// Tablet ≥768px: 2 columns
// Mobile <768px: 1 column
@media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
@media (min-width: 768px)  { grid-template-columns: repeat(2, 1fr); }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `DAY_KEY_MAP` translation correctness | Unit test verifying `i18n.translate()` output for each day key |
| Integration | KPI grid at 3 breakpoints | Browser resize test at 1440px, 1024px, 768px, 375px |
| Integration | Tooltip confinement on bar/area/donut | Visual test at container edges (left/right) |
| E2E | Footer full-width visual separation | Screenshot comparison at 1440px |

## Migration / Rollout

No migration required — all changes are CSS/i18n/config edits with zero database or API impact.

## Open Questions

None — all three issues are well-scoped with clear solutions.
