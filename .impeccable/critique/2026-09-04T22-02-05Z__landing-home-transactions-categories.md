---
target: landing-home-transactions-categories
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-09-04T22-02-05Z
slug: landing-home-transactions-categories
---
# UX Critique: Landing, Home, Transactions & Categories

Method: dual-agent (A: afb9fc34-bcb6-4464-8fb2-967c1fe03a5b · B: e90d3a22-6783-41e0-9e9a-65bb09df7e04)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3 | Skeletons work well; Dashboard lacks an active date range indicator. |
| 2 | Match System / Real World | 3 | Solid fintech domain terminology; minor icon incongruities. |
| 3 | User Control and Freedom | 3 | Modal dismissals present; dropdown menus lack keyboard Esc handling. |
| 4 | Consistency and Standards | 2 | Mixed Spanish and English strings; duplicate wrapper tags. |
| 5 | Error Prevention | 3 | Destructive actions prompt confirmation; amount inputs masked. |
| 6 | Recognition Rather Than Recall | 2 | Filter chips aid recognition; advanced indicators lack visual cues. |
| 7 | Flexibility and Efficiency | 2 | Bulk selection implemented; lacks keyboard accelerators (`N`, `/`). |
| 8 | Aesthetic and Minimalist Design | 2 | Obsidian glass styling is clean, but free tier shows 4 concurrent paywalls. |
| 9 | Error Recovery | 2 | Error states present with retries; form validation feedback is generic. |
| 10 | Help and Documentation | 2 | Landing FAQ exists; contextual finance guidance in app is minimal. |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

**LLM Assessment**: High financial product character grounded in an obsidian dark glass motif, JetBrains Mono tabular typography, and native Telegram tracking channels. However, it displays typical SaaS template patterns in feature grids and stacks multiple upgrade paywalls for free users.

**Deterministic Scan**: 10 primary findings and 20 advisory items. The scan highlighted 2 side-tab borders on AI cards, 4 gradient text headings/metrics, and 3 layout-triggering width transitions. 1 finding (`broken-image` on Angular `[src]`) was confirmed as a false positive.

**Visual Overlays**: Headless scan environment; in-browser script injection skipped. Fallback deterministic CLI output analyzed directly.

## Overall Impression

The interface presents a cohesive, high-end financial vault feel, but is held back by accessible contrast resting states, mixed language strings, and paywall visual noise.

## What's Working

- **Distinctive Visual Identity**: Obsidian glass layers, purple accent glow, and tabular figures deliver a refined fintech experience.
- **Multi-Channel Telegram Integration**: Telegram tracking treated as a primary input channel creates clear product differentiation.
- **Resilient Core States**: Thoughtful empty states, loading skeletons, and error fallbacks across all main views.

## Priority Issues

### [P1] Accessibility: Nested Interactive Roles & Low Contrast
- **Why it matters**: `transaction-row` nests interactive button/checkbox roles, and category action buttons sit at `opacity: 0.35` at rest, falling below WCAG AA contrast.
- **Fix**: Decouple row click targets and raise resting opacity on category actions to meet 4.5:1 contrast.
- **Suggested command**: `$impeccable audit`

### [P1] Inconsistent Internationalization (i18n)
- **Why it matters**: Hardcoded Spanish in the dashboard mixes with hardcoded English in transaction tables and landing copy, degrading perceived quality.
- **Fix**: Move all hardcoded text strings into translation json files via `TranslatePipe`.
- **Suggested command**: `$impeccable clarify`

### [P2] Dashboard Paywall Visual Overload
- **Why it matters**: Free accounts encounter 4 simultaneous upgrade prompts (trial banner, AI Insights, Goals, Pockets), fragmenting visual hierarchy.
- **Fix**: Consolidate upgrade prompts into a single intelligent summary card or preview state.
- **Suggested command**: `$impeccable quieter`

### [P2] Detected AI Styling Anti-Patterns
- **Why it matters**: Gradient text on core metrics and colored side-tab borders on AI cards produce template-like aesthetics that conflict with clean typography rules.
- **Fix**: Switch metric values to solid high-contrast tokens and replace side-tab borders with subtle background surface shifts.
- **Suggested command**: `$impeccable polish`

### [P3] Layout Thrashing in Progress Bar Animations
- **Why it matters**: Transitioning `width` triggers repeated browser layout reflows on dashboard widgets.
- **Fix**: Animate using `transform: scaleX(...)` with `transform-origin: left`.
- **Suggested command**: `$impeccable optimize`

## Persona Red Flags

- **Alex (Power User)**: Lacks keyboard shortcuts (`N` for new entry, `/` for search, `Esc` to close); rows lack keyboard activation.
- **Jordan (First-Timer)**: Confronted by 4 upgrade prompts on initial entry; confused by mixed language labels.
- **Sam (Accessibility)**: Screen readers stumble on nested interactive row elements; washed out icons at rest.

## Minor Observations

- Landing pricing table declared in component but omitted from template rendering.
- Duplicate opening wrapper tag `<div class="cat-page">` in categories template.
- Dashboard header lacks an active period indicator.

## Questions to Consider

- Could free-tier users receive 1 active Pocket/Goal preview instead of 3 full locked cards?
- Should Telegram bot setup become the primary onboarding action for new accounts?
