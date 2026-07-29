---
target: Analytics page
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-07-28T23-01-54Z
slug: src-app-features-analytics-pages-analytics-page-ts
---
## Critique Report — Analytics Page

**Method: dual-agent (A: general · B: general)**

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No loading indicator on filter-triggered data refetch; cross-filter badge too subtle |
| 2 | Match System / Real World | 3 | Financial concepts map cleanly, but 15% savings target is opaque |
| 3 | User Control and Freedom | 3 | Multiple date paths but no undo toast on chart click filter |
| 4 | Consistency and Standards | 3 | Hardcoded "Filtrado:" string breaks i18n consistency |
| 5 | Error Prevention | 2 | Custom dates accept any input; silent failure on start > end |
| 6 | Recognition Rather Than Recall | 3 | All filters visible but cross-filter badge requires remembering context |
| 7 | Flexibility and Efficiency | 3 | Multiple date-range paths but no keyboard shortcuts or saved views |
| 8 | Aesthetic and Minimalist Design | 3 | Glass aesthetic coherent but page is content-dense; toolbar bloat undermines minimalism |
| 9 | Error Recovery | 2 | Generic error message; no error categorization or offline fallback |
| 10 | Help and Documentation | 1 | Zero inline tooltips or contextual help beyond welcome banner |
| **Total** | | **26/40** | **Acceptable** |

### Design Specificity Verdict

**LLM assessment:** The glass-morphism shell is distinctly Flowr — KPI card glow lines, backdrop-blur surfaces, amethyst pulse borders at 6–8% opacity — applied consistently across 6+ component types. However, the chart typology (area trends, donut categories, bar daily/weekly) is the most generic financial dashboard composition possible. The ECharts theme mapper applies the Flowr palette correctly, but the chart forms themselves would work unchanged in any banking or fintech product. Net: 60% Flowr, 40% category-interchangeable.

**Deterministic scan:** The detector found 20 issues across 7 SCSS files. Two systemic drifts: #9D50BB/rgba(157,80,187,...) — 5 occurrences of undocumented purple; 6px radius — 5 occurrences across 5 files, not in the documented scale {4,8,12,16,24}. The HTML template itself is clean — zero findings.

### Overall Impression

A competent, high-polish analytics dashboard with clean glass execution. Three issues define the ceiling: KPI values in Inter instead of JetBrains Mono, header toolbar with 7 date-filtering mechanisms, and emotionally uncontrolled last viewport element.

### What's Working

1. Staggered reveal animations (0-350ms) create natural scan rhythm guiding eye from KPIs → trends → details
2. Glass-morphism applied consistently across 6+ component types with correct border opacities
3. Welcome banner is thoughtful progressive-disclosure for new users

### Priority Issues

**[P0] KPI card monetary values use Inter instead of JetBrains Mono**
Direct violation of Number Font Rule. Change .kpi-card__value font-family to var(--font-mono). Command: typeset.

**[P0] Cross-filter badge hardcoded Spanish text bypassing i18n**
"Filtrado:" displays Spanish to all locales. Also inaccessible: <div> with click, no role=button. Command: harden.

**[P1] Header toolbar density — 7 controls compete in one row**
Four overlapping date-filtering mechanisms. Collapse into single smart date-range control. Command: distill.

**[P1] Multiple Display-weight-700 elements violate One Hero Rule**
Page heading + insight titles + comparison titles all at 700. Set sub-components to 600. Command: typeset.

**[P2] No loading indicator when filter changes trigger data reload**
Stale data shown 500ms-2s with zero feedback during refetch. Add shimmer or progress bar. Command: harden.

**[P2] Chart click drill-down has no undo affordance**
Instant full-dashboard filter without confirmation. Add toast with undo. Command: harden.

**[P3] Daily spending chart always shows current week regardless of period**
Timeframe disconnect when viewing 6M trends alongside this-week daily data. Add label or hide for long periods. Command: clarify.

### Persona Red Flags

**Alex (Power User):** No keyboard shortcuts, saved views, export, or compound drill-down; charts mandatory and fixed-position.

**Jordan (First-Timer):** 12+ data points on first load overwhelming; no tooltips explaining savings rate; month selector + period buttons = paralyzing duplicate UI; chart types have no inline explanations.

**Sam (Accessibility):** KPI trend badges rely on color alone; cross-filter badge not keyboard-focusable; ECharts content not keyboard-navigable; period buttons not in radiogroup; loading skeleton pulse no reduced-motion guard.

### Minor Observations

- Period button active state uses box-shadow — violates Flat-By-Default Rule
- Month selector active option shares --accent-glow token with KPI glow → semantic ambiguity
- Chart skeleton shimmer animates endlessly — should stop on timeout or data load
- 15% savings baseline hardcoded in mapToKpis() — requires code deploy to change
- Detector confirms 6px radius is systemic drift across 5 files
