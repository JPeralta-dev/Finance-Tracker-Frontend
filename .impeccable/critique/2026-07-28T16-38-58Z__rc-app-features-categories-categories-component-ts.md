---
target: section Categories
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
p2_count: 1
timestamp: 2026-07-28T16-38-58Z
slug: rc-app-features-categories-categories-component-ts
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeleton loading and toast notifications work, but hover-revealed edit/delete actions are invisible to keyboard and touch users — they can't perceive those affordances exist |
| 2 | Match Between System and Real World | 3 | Categories, totals, percentages, and "highest" stats are natural financial concepts; the arrow link to transactions mirrors real-world drill-down behavior |
| 3 | User Control and Freedom | 3 | Cancel on delete works, default categories protected; gap: no undo after delete, no unsaved-changes warning when editing in modal |
| 4 | Consistency and Standards | 2 | Multiple DESIGN.md violations: currency in Space Grotesk not JetBrains Mono, spacing values outside 4px scale, hardcoded colors outside palette |
| 5 | Error Prevention | 3 | Confirm dialog before delete, protected default categories, smart defaults on create form; gap: no protection against losing unsaved modal edits |
| 6 | Recognition Rather Than Recall | 2 | Edit/delete icon buttons have no visible text labels; "View Transactions" link and action buttons hidden until hover, forcing recall |
| 7 | Flexibility and Efficiency of Use | n/a | Dashboard/Operate surface — no keyboard shortcuts, bulk actions, or power features expected at this level |
| 8 | Aesthetic and Minimalist Design | 2 | Glass aesthetic and Amethyst Pulse CTA are on-brand, but decorative overshoot easing on financial data, multiple 700-weight elements compete, spacing drift creates visual noise, card top-highlight ::before is missing |
| 9 | Error Recovery | 2 | Toast provides error messages but no undo mechanism for deletes; error handling is fire-and-forget |
| 10 | Help and Documentation | n/a | Dashboard/Operate surface — contextual help not expected at this layer |
| **Total** | | **19/32** | **Acceptable** (59%) |

## Design Specificity Verdict

**Mixed.** The glass surfaces, Amethyst Pulse primary CTA, and dark-first Obsidian Void palette unmistakably belong to Flowr Finance. No other finance app ships this exact material language. However, the category grid structure — icon circles, color bars, totals, and hidden action buttons — is a generic pattern that any budgeting tool could swap in without changing a line of layout. The skeleton is interchangeable; the surfaces are Flowr.

**What the detector found:** 4 findings — 2 quality warnings (bounce easing + layout property animation on `.cat-fill` at line 219), 2 design-system advisory (hardcoded `rgba(157, 80, 187, 0.4)` in hover glow and hardcoded `#9D50BB` default color in TS, neither in the DESIGN.md palette). The detector confirmed what the design review suspected: the overshoot animation is both a brand violation and a performance anti-pattern. The two hardcoded color values are additional drift from the token system.

## Overall Impression

The page has a solid glass-foundation. The stats row is excellent — three tight metrics that answer critical questions in a glance. The delete flow with confirm dialog is well-structured. But typographic discipline has collapsed: every category card shouts its total at 700-weight in Space Grotesk instead of the mandated JetBrains Mono, spacing values drift from the 4px scale in seven places, and the bar fill animation bounces — decorative motion on sacred financial data. The hover-revealed action layer excludes keyboard and touch users entirely. The single biggest opportunity is restoring typographic order: one 700-weight heading, JetBrains Mono on every currency value. That alone would make the page feel intentional instead of rushed.

## What's Working

- **Stats row is genuinely excellent.** Three tight metrics with glass dividers, uppercase labels at the right text-tertiary opacity, and space-balanced layout. It answers "how many, which one, how much" in a single glance — exactly the 3-second clarity the product demands.
- **Category color bars with percentage labels create an immediate proportional read.** The visual bar width tells the story; the percentage confirms it. Coupled with the 2-letter `categoryMark()` computed on the fly (no icon dependency), this is efficient data visualization.
- **Delete confirmation flow is well-structured.** The `pendingDeleteCategory` pattern separates intent from execution, default categories are protected with a clear toast, and the confirm dialog provides explicit Cancel/Delete labels rather than generic OK/Cancel.

## Priority Issues

### [P0] Currency amounts render in Space Grotesk instead of JetBrains Mono
**Why it matters:** The Number Font Rule is a core brand contract — JetBrains Mono on all currency, percentages, and numeric data signals precision and trust. `.cat-total` and `.stat-value` (currency display) in Space Grotesk at 700 weight undermines the entire typographic system. This is the most visible, most repeated violation — every category card broadcasts it.
**Fix:** Change `.cat-total` `font-family` to `var(--font-mono)`, reduce weight from 700 to 500. Apply same to `.stat-value` when displaying currency (keep display font for the count stat).
**Suggested command:** `$impeccable typeset categories`

### [P1] Edit, delete, and View Transactions actions hidden until hover — inaccessible to keyboard and touch
**Why it matters:** Keyboard-only users (Tab navigation) and touch users cannot trigger hover. The entire action surface — editing, deleting, drilling into transactions — is invisible to them. This is functional exclusion, not polish. The detector confirmed no hover alternatives exist.
**Fix:** Show a visible "⋯" (more) button on each card at all times. On click/tap, reveal edit, delete, view transactions inline. Alternatively, show actions at reduced opacity (30%) at rest, rising to full on hover/focus.
**Suggested command:** `$impeccable harden categories`

### [P1] Seven spacing values outside the 4px scale
**Why it matters:** The 4px spacing scale is the system's rhythm contract. Values found: 28px (`.cat-page` gap), 10px (`.btn-new` padding, `.cat-card` gap), 22px (`.cat-card` padding), 18px (`.stats-row` padding), 5px (`.cat-bar` height), 2px (`.cat-link` margin). Each deviation chips at the Glass Vault's precision. DESIGN.md states: "No custom one-off spacings."
**Fix:** `.cat-page` gap 28px → 32px; `.btn-new` padding 10px → 12px; `.cat-card` padding 22px → 24px; `.cat-card` gap 10px → 12px; `.stats-row` padding 18px → 16px or 20px; `.cat-bar` height 5px → 4px; `.cat-link` margin 2px → 4px.
**Suggested command:** `$impeccable layout categories`

### [P1] Bar fill animation uses overshoot bounce on financial data
**Why it matters:** `cubic-bezier(0.34, 1.56, 0.64, 1)` with y=1.56 creates a decorative overshoot bounce. The detector flagged this as both `bounce-easing` and `layout-transition` (animating `width` causes layout thrash). DESIGN.md explicitly forbids animating financial data for decoration. The bounce undermines trust.
**Fix:** Change to `cubic-bezier(0.4, 0, 0.2, 1)` (standard deceleration). Duration from 1s to 400ms. Prefer `transform: scaleX()` or `clip-path` over `transition: width` for GPU-composited animation.
**Suggested command:** `$impeccable animate categories`

### [P2] Accessibility gaps — missing :focus-visible and undersized touch targets
**Why it matters:** No `:focus-visible` styles on `.cat-action` buttons or `.cat-link` means keyboard users navigating via Tab have no position indicator. At 28×28px, action buttons are 64% below the 44×44px minimum required below 768px — physically hard to tap one-handed. Both the design review and the manual scan confirmed these.
**Fix:** Add `outline: 2px solid var(--accent-start)` with `outline-offset: 2px` on all interactive elements. Increase `.cat-action` to 36×36px default, 44×44px at ≤768px. Increase gap between edit/delete from 4px to 8px.
**Suggested command:** `$impeccable harden categories` + `$impeccable adapt categories`

## Persona Red Flags

**Alex (Power User):** No keyboard shortcuts for any category operation. Edit/delete actions hidden until hover — impossible via keyboard Tab without `:focus-within` workarounds that don't exist. One-at-a-time card interaction with no bulk selection or batch categorization. Hover-dependency across the entire action layer means the interface fundamentally requires a mouse.

**Jordan (First-Timer):** Edit and delete icons have no visible text labels at rest — sees unlabeled 28px circles and must guess what the pencil and X icons do. "Default" badge has no tooltip explaining why the category can't be modified. Confirm dialog message is hardcoded English, jarring for non-English users. View Transactions link invisible until hover — Jordan never discovers the drill-down path.

**Casey (Distracted Mobile User):** 28×28px buttons physically too small for one-thumb operation — mis-taps likely between adjacent edit and delete. No undo after delete — one wrong thumb tap permanently removes a category. Hover-revealed actions completely non-functional on mobile. Stats row at 480px collapses without dividers and wraps arbitrarily, making the summary harder to parse while walking.

## Minor Observations

- Card top-highlight `::before` pseudo-element (gradient line transparent → glass-border-hover → transparent) is missing from `.cat-card`. The system spec mandates this as the physical edge of glass surfaces.
- `.btn-new` hover uses hardcoded `rgba(157, 80, 187, 0.4)` instead of a design token. `#9D50BB` is not in the palette — should use `--glow-accent`.
- `.btn-new` text uses `var(--text-inverse)` but the design system spec says primary button text should be Obsidian Void (`#120B1A`). Verify `--text-inverse` maps correctly.
- No `prefers-reduced-motion` handling on the skeleton shimmer `@keyframes` or the bar fill transition — users with motion sensitivity get both animations regardless of OS preference.
- Empty state `actionRoute` points to `/transactions/new` but the user is on categories — it should offer to create a category, not a transaction.
- Skeleton count is hardcoded to 9 — if fewer categories exist, placeholder density misleads about expected card count.
- The 2-letter `categoryMark()` function returns "OT" for names without clear word boundaries — this fallback is cryptic.

## Questions to Consider

- What if category cards showed only name, total, and bar at rest — and revealed edit/delete/transactions on a single tap instead of hover? Would that make the page calmer AND more accessible?
- Does every category card need a 700-weight currency total competing with the page title? What story would the hierarchy tell if the page had ONE hero number?
- The stats row is the strongest element on the page. What if the card grid learned from it — tighter, calmer, with progressive disclosure?
