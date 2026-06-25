# Exploration: Analytics KPI Grid, Chart Tooltip/i18n, and Landing Footer UX

## Issue 1 — Analytics KPI Cards Not Filling Horizontal Space

### Current State
The analytics page uses 4 KPI cards rendered inside `analytics-kpis.component.html` (line 13) with a CSS grid defined in `analytics-kpis.component.scss` (line 1-9):

```scss
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
```

The home dashboard (`dashboard.page.scss`, line 64-72) uses a completely different approach:

```scss
.stats-grid--2col {
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Root Cause
`repeat(auto-fill, minmax(220px, 1fr))` creates as many 220px-minimum columns as fit in the container, then distributes remaining space equally. On a ~1440px container with 24px safe-area padding on each side (~1392px usable), 4 cards at 220px minimum = 880px + 3 gaps at 16px = 48px = 928px used. The remaining ~464px gets distributed, making each card ~336px wide. But at certain viewport widths (especially between ~900px and ~1100px), `auto-fill` may only fit 3 columns, leaving the 4th card on a new row with significant white space to its right.

The dashboard's `repeat(2, 1fr)` is explicit: always 2 columns at 768px+, each taking exactly 50% of available width. No gaps, no ambiguity.

### Affected Files
| File | Lines | Change |
|------|-------|--------|
| `analytics-kpis.component.scss` | 1-9 | Grid definition — primary fix |
| `analytics-kpis.component.scss` | 11-14 | Skeleton grid — mirror fix |
| `analytics.page.scss` | 64-68 | Parent row wrapper (no change needed, already `display: block`) |

### Recommended Approach
Replace `auto-fill` with explicit column counts at breakpoints, matching the dashboard pattern:

```scss
.kpis-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

This guarantees: 1 column on mobile, 2 on tablet, 4 on desktop — always filling 100% width. Mirror the same pattern in `.kpis-skeleton`.

### Risks
- **None significant.** This is a pure CSS change with no behavioral impact. The skeleton grid must be updated in sync to avoid layout shift during loading.

---

## Issue 2 — Weekly Expenses Bar Chart: Tooltip Overflow + Day Names Not Translated

### Current State

#### 2a — Tooltip Overflow
`echarts-theme.mapper.ts`, `buildBarOption()` (line 287-294) configures the tooltip:

```typescript
tooltip: {
  trigger: 'axis',
  backgroundColor: css.bgTertiary,
  borderColor: css.borderColor,
  borderWidth: 1,
  textStyle: { color: css.textPrimary, fontFamily: "'Inter', sans-serif" },
  extraCssText: 'border-radius: 8px; backdrop-filter: blur(12px);',
},
```

**Missing: `confine: true`**. Without this, ECharts positions the tooltip absolutely relative to the chart container, and edge bars (Monday leftmost, Sunday rightmost) cause the tooltip to overflow and get clipped by `overflow: hidden` on `.ft-echart-container` (ft-echart.component.ts, line 88).

#### 2b — Day Names Not Translated
The data flow is:
1. Backend returns `DailySpending` with `days: { label: string; amount: number }[]` (analytics-api.service.ts, line 64-69)
2. `analytics.page.ts` line 396: `daily.days.map(d => d.label)` passes labels as-is to `buildBarOption()`
3. `buildBarOption()` line 298: `data: labels` sets them directly as xAxis category data

The labels come from the backend in English (Mon, Tue, Wed...). There are **no i18n keys defined** for day names in any of the translation files (en.json, es.json, fr.json). The `TranslationService` is available in the analytics page (`this.i18n`) but is not used for day labels.

### Affected Files
| File | Lines | Change |
|------|-------|--------|
| `echarts-theme.mapper.ts` | 287-294 | Add `confine: true` to tooltip |
| `echarts-theme.mapper.ts` | 218-226 | Add `confine: true` to `buildAreaOption()` tooltip (same issue) |
| `echarts-theme.mapper.ts` | 345-352 | Add `confine: true` to `buildDonutOption()` tooltip (proactive) |
| `analytics.page.ts` | 390-399 | Translate day labels before passing to chart |
| `en.json` | ~420 | Add `analytics.days.mon` through `analytics.days.sun` keys |
| `es.json` | ~420 | Add Spanish day translations (Lun, Mar, Mié, Jue, Vie, Sáb, Dom) |
| `fr.json` | ~420 | Add French day translations (Lun, Mar, Mer, Jeu, Ven, Sam, Dim) |
| `analytics-api.service.spec.ts` | 46-52 | Update test mock data labels |

### Recommended Approach

**Fix 2a — Tooltip overflow (trivial):**
Add `confine: true` to all three `build*Option()` methods in `echarts-theme.mapper.ts`. This tells ECharts to constrain the tooltip within the chart container bounds.

**Fix 2b — Day name translation (two options):**

| Approach | Pros | Cons | Complexity |
|----------|------|------|------------|
| **A: Translate in analytics.page.ts** before calling `buildBarOption()` | Simple, uses existing `TranslationService`, no backend changes | Requires adding 7 i18n keys per locale | Low |
| **B: Backend returns locale-aware labels** | Single source of truth | Requires backend change, couples backend to frontend locale | Medium |

**Recommendation: Approach A.** The frontend already has `TranslationService` injected and actively uses it for category names (line 385: `this.i18n.translate(c.category)`). Add day name keys and translate in the `dailyChartOptions()` computed signal:

```typescript
readonly dailyChartOptions = computed<EChartsOption | undefined>(() => {
  const daily = this.store.dailySpending();
  if (!daily?.days || daily.days.length === 0) return undefined;
  const colors = this.themeMapper.categoryColors();
  return this.themeMapper.buildBarOption(
    daily.days.map(d => this.i18n.translate(`analytics.days.${d.label.toLowerCase()}`)),
    [{ label: this.i18n.translate('analytics.dailySpending'), data: daily.days.map(d => d.amount), color: colors[2] }],
  );
});
```

This assumes the backend returns lowercase day labels (`mon`, `tue`, etc.) or we map them. If the backend returns `Mon`, `Tue` (capitalized), we need a small mapping:

```typescript
const dayKeyMap: Record<string, string> = {
  'Mon': 'mon', 'Tue': 'tue', 'Wed': 'wed', 'Thu': 'thu',
  'Fri': 'fri', 'Sat': 'sat', 'Sun': 'sun',
};
daily.days.map(d => this.i18n.translate(`analytics.days.${dayKeyMap[d.label] ?? d.label.toLowerCase()}`)),
```

### Risks
- **Backend label format unknown**: If the backend returns full names (`Monday`) or different casing, the mapping needs adjustment. Check actual API response.
- **ECharts `confine: true` on mobile**: On very narrow screens, even confined tooltips may overlap bars. This is acceptable — better than being clipped entirely.
- **Translation pipe in computed signal**: The `TranslationService.translate()` is synchronous, so it works fine in a computed signal. No async issues.

---

## Issue 3 — Landing Page Footer Should Occupy Full-Width "Absolute" Space

### Current State
The landing page structure (`landing.component.html`, line 57):
```html
<!-- Footer -->
<ft-footer />
```

The footer is placed directly inside `.landing` without a `.section-full` wrapper. Compare with other sections:
- Features (line 15): `<section class="features section-full">`
- Telegram (line 38): `<section class="telegram-wrapper section-full">`
- Final CTA (line 52): `<section class="final-cta-wrapper section-full">`

The footer component itself (`footer.component.scss`):
- `.footer` (line 1-7): `padding: 64px 0 24px; background: var(--bg-primary); border-top: 1px solid var(--glass-border);`
- `.footer__inner` (line 9-15): `max-width: var(--content-max-width); margin: 0 auto; padding: 0 24px;`

### Root Cause
The footer's background color (`var(--bg-primary)`) is **identical to the page background** (`.landing` also uses `var(--bg-primary)` on line 3 of `landing.component.scss`). Combined with:
1. No `.section-full` wrapper (no padding separation from the section above)
2. Only a subtle `border-top: 1px solid var(--glass-border)` as visual separator
3. No decorative gradient or visual treatment to distinguish it as a "closing" section

The footer visually blends into the page rather than feeling like a distinct full-bleed section. It's not that it's constrained horizontally — the `.footer` element itself spans 100% width. The issue is **visual separation and perceived weight**.

### Affected Files
| File | Lines | Change |
|------|-------|--------|
| `landing.component.html` | 57 | Wrap footer in a section with padding |
| `landing.component.scss` | 10-16 | Possibly add a footer-specific section class |
| `footer.component.scss` | 1-7 | Enhance visual separation (gradient, larger top padding, or subtle background shift) |

### Recommended Approach

**Option A — Wrap in section-full (simplest):**
```html
<section class="footer-wrapper section-full">
  <ft-footer />
</section>
```
Add to `landing.component.scss`:
```scss
.footer-wrapper {
  padding: 0; // Footer has its own padding
  background: var(--bg-primary);
}
```

**Option B — Enhance footer visual weight (recommended):**
The footer already has `border-top` and decorative art. The real fix is making it feel like a proper "closing" section:

1. Add a subtle gradient overlay or slightly different background tone to `.footer`
2. Increase the top padding or add a visual transition element
3. Keep the footer as-is in the HTML (no wrapper needed) — the `.footer` element already spans full width

```scss
.footer {
  padding: 80px 0 24px; // Increased from 64px
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 60px);
  border-top: 1px solid var(--glass-border);
  // ...
}
```

This creates a subtle gradient that transitions from `bg-secondary` at the top (matching the section above's feel) into `bg-primary`, giving visual depth without changing the color palette.

### Risks
- **Gradient may clash with dark theme**: Need to test the gradient against the obsidian palette. If `bg-secondary` is too dark, use a very subtle opacity overlay instead.
- **User said "absolute space"**: If the user literally wants the footer to push to the bottom of the viewport (sticky footer behavior), that's a different fix — requires `min-height: 100vh` + flex column on `.landing` with `margin-top: auto` on the footer. But based on the description, the issue seems to be visual separation, not vertical positioning.

---

## Summary

### Estimated Lines Changed
| Issue | Files | Lines Changed | Type |
|-------|-------|---------------|------|
| 1 — KPI Grid | 1 file | ~10 lines | CSS only |
| 2a — Tooltip | 1 file | ~3 lines (add `confine: true` x3) | TypeScript |
| 2b — Day i18n | 5 files | ~30 lines | TS + JSON + test |
| 3 — Footer | 2 files | ~8 lines | CSS + HTML |
| **Total** | **8 files** | **~51 lines** | |

### PR Slicing Recommendation
These 3 issues are **fully independent** and can be split into separate PRs:

1. **PR 1: KPI grid fix** — Pure CSS, zero risk, instant visual improvement
2. **PR 2: Chart tooltip + day i18n** — Two related chart fixes in one PR (same component, same data flow)
3. **PR 3: Footer visual enhancement** — Pure CSS/HTML, isolated to landing page

### Ready for Proposal
**Yes.** All three issues have clear root causes, well-defined fixes, and minimal risk. The orchestrator should present these as either:
- A single change with 3 independent tasks, or
- 3 separate changes for independent PR slicing
