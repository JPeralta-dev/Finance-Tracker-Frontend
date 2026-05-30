# Exploration: Animation Overhaul

## Current State

The frontend has **three competing animation systems** plus one dead code set:

1. **ScrollRevealDirective** (`scroll-reveal.directive.ts`) — 17 usages across dashboard (9) and analytics (8). Single effect: opacity 0→1 + translateY(24px)→0 via CSS transition. IntersectionObserver-based.
2. **ScrollAnimateDirective** (`scroll-animate/scroll-animate.directive.ts`) — 28 usages across landing, categories, transactions, settings. 5 animation types via CSS classes (`fade-up`, `fade-in`, `slide-left`, `slide-right`, `scale-in`). Dual-mode: CSS scroll-timeline or IntersectionObserver fallback.
3. **CountUpDirective** (`count-up.directive.ts`) — 1 usage in `stat-card.component.html`. Animates numbers 0→target via requestAnimationFrame, 4000ms linear.
4. **Angular animation triggers** (`animations.ts`) — 7 triggers defined, only `pageTransition` used in `app.component.ts`. The other 6 (`fadeSlideIn`, `staggerList`, `cardEntrance`, `rowEntrance`, `drawerSlide`, `counterPop`) are **dead code**.

Additionally, `HoverDepthDirective` provides hover interactions and should be kept untouched.

## Affected Areas

### Directives to replace/modify
- `src/app/shared/directives/scroll-reveal.directive.ts` — replace with unified WAAPI directive
- `src/app/shared/directives/scroll-animate/scroll-animate.directive.ts` — replace with unified WAAPI directive
- `src/app/shared/directives/count-up.directive.ts` — replace numeric animation with WAAPI-compatible approach
- `src/app/shared/directives/index.ts` — update exports
- `src/app/shared/animations.ts` — remove 6 dead triggers, keep or remove `pageTransition`

### Templates to update (17 files)
| File | Current Directive | Count |
|------|-------------------|-------|
| `dashboard.page.html` | ftScrollReveal | 9 |
| `analytics.page.html` | ftScrollReveal | 8 |
| `categories.component.html` | ftScrollAnimate | 3 |
| `landing.component.html` | ftScrollAnimate | 3 |
| `telegram-section.component.html` | ftScrollAnimate | 2 |
| `hero-section.component.html` | ftScrollAnimate | 6 |
| `final-cta.component.html` | ftScrollAnimate | 3 |
| `transaction-form.component.html` | ftScrollAnimate | 4 |
| `settings.component.html` | ftScrollAnimate | 3 |
| `stat-card.component.html` | ftCountUp | 1 |

### Component imports to update (8 .ts files)
- `dashboard.page.ts`, `analytics.page.ts` — ScrollRevealDirective
- `categories.component.ts`, `landing.component.ts`, `telegram-section.component.ts`, `hero-section.component.ts`, `final-cta.component.ts`, `transaction-form.component.ts`, `settings.component.ts` — ScrollAnimateDirective
- `stat-card.component.ts`, `dashboard.page.ts` — CountUpDirective

## Effect Mapping (24 catalog effects → UI element types)

### Page/Section Headings (h1, h2, h3)
**Recommended: `per-word-crossfade`**
- Target: `per-word`, duration 700ms, stagger 70ms, y_px 8 drift
- Why: Calm, editorial rhythm. Readable during stagger. Premium without being flashy.
- Alternative for hero titles only: `soft-blur-in` (per-character, 900ms, blur + y motion) — but only for the landing hero h1, not dashboard/analytics titles (blur on dark glass backgrounds can look muddy).

### Numeric Counters (stat card values)
**Recommended: `micro-scale-fade`**
- Target: `whole`, duration 600ms, scale 0.96→1.0
- Why: Subtle premium polish. The numeric value animates as a single unit with a tiny scale pop — feels like a "settle" rather than a count. Much faster than current 4000ms CountUp.
- Caveat: This replaces the "count from 0 to N" behavior. The number appears at its final value with a scale+fade entrance. If the user wants the counting behavior preserved, we'd need a custom WAAPI numeric counter (not from the catalog).

### List Items (transaction rows, category cards)
**Recommended: `per-word-crossfade` applied to container elements with stagger**
- Target: `whole` on each container, with directive-level stagger delay
- Why: Each row/card enters as a unit with opacity 0→1 + translateY(8px)→0, staggered 60ms per item. This matches the current scroll-reveal behavior but with WAAPI and tighter easing.

### Card Containers (stat cards, chart containers)
**Recommended: `micro-scale-fade`**
- Target: `whole`, duration 600ms, scale 0.96→1.0
- Why: Cards "settle" into place with a barely-perceptible scale. Premium feel without distraction.

### Landing Hero Title
**Recommended: `soft-blur-in`**
- Target: `per-character`, duration 900ms, stagger 25ms, blur 12px + y 16px
- Why: This is the one place where a more dramatic reveal is appropriate. The landing page is marketing-facing.

### Landing Section Subtitles/Body
**Recommended: `per-word-crossfade`**
- Target: `per-word`, duration 700ms, stagger 70ms
- Why: Consistent with headings but slightly less prominent.

## Technical Approach Comparison

### Option A: Single `FtSubtleReveal` Directive (RECOMMENDED)

Create one parameterized directive: `[ftSubtleReveal]="effectType"` with `@Input() ftSubtleRevealDelay`, `@Input() ftSubtleRevealThreshold`.

```typescript
@Directive({ selector: '[ftSubtleReveal]', standalone: true })
export class FtSubtleRevealDirective {
  @Input('ftSubtleReveal') effect: RevealEffect = 'fade-up';
  @Input() delay = 0;
  @Input() threshold = 0.1;
  // Internal: IntersectionObserver + element.animate()
}
```

**Pros:**
- Single import, single directive to learn
- Easy to swap effect types per-element without changing imports
- Centralized WAAPI animation engine
- Easy to add new effects later
- Replaces both existing scroll directives + can handle numeric counters

**Cons:**
- Larger directive file (~200-250 lines)
- Need an effect registry/map inside the directive
- Slightly more complex testing surface

**Effort:** Medium

### Option B: Separate Directives per Effect Family

Create `FtTextRevealDirective`, `FtContainerRevealDirective`, `FtNumericRevealDirective`.

**Pros:**
- Each directive is small and focused
- Easier to test individually
- Clear semantic intent per use case

**Cons:**
- Three imports instead of one
- Template authors need to know which directive to use
- More boilerplate across 17 template files
- Harder to maintain consistency

**Effort:** Medium-High

### Option C: Extend Existing `ftScrollReveal`

Add `@Input() ftScrollRevealEffect` to the current directive.

**Pros:**
- Minimal new code
- Existing 17 usages keep working with defaults

**Cons:**
- The current directive uses CSS transitions, not WAAPI
- Mixing CSS transitions and WAAPI in the same directive is fragile
- Doesn't address the `ftScrollAnimate` directive at all
- The directive already has 3 inputs; adding more makes it unwieldy
- Doesn't solve the CountUp replacement

**Effort:** Low (but incomplete)

## Recommendation: Option A

**`FtSubtleReveal`** as a single parameterized WAAPI directive is the cleanest path. It:
1. Replaces both scroll directives with one unified system
2. Supports all needed effect types via a registry
3. Can be extended to handle numeric counters (or we create a small `FtNumericReveal` companion)
4. Keeps template changes simple: just swap directive name and effect type

### Proposed Effect Registry

```typescript
type RevealEffect =
  | 'fade-up'           // containers, cards (opacity + translateY)
  | 'fade-in'           // inline elements (opacity only)
  | 'scale-in'          // cards with micro-scale (scale 0.96→1 + opacity)
  | 'slide-right'       // content blocks (translateX)
  | 'slide-left'        // content blocks (translateX)
  | 'text-crossfade'    // headings (per-word, opacity + small y)
  | 'text-blur-in'      // hero titles (per-char, blur + y)
  | 'numeric-settle'    // stat values (micro-scale-fade on final value)
```

Each effect maps to a WAAPI keyframe array + timing config.

## Migration Complexity

### File count: ~28 files
- 1 new directive file + 1 spec file
- 1 updated `index.ts`
- 3 old directive files (keep for deprecation or delete)
- 1 `animations.ts` cleanup
- 17 template files (directive selector swap)
- 8 component `.ts` files (import swap)

### Complexity: Medium
- Template changes are mechanical: find/replace directive selector + add effect type
- Import changes are mechanical
- The WAAPI directive itself is the main engineering effort
- TDD requirement means each effect type needs test coverage

## Risks and Gotchas

1. **WAAPI browser support**: `element.animate()` is supported in all modern browsers, but the `composite: 'accumulate'` option (needed for some effects) has spotty support. Stick to `composite: 'replace'` (default).

2. **Performance on low-end devices**: Per-character effects (`soft-blur-in`) create many DOM spans. On mobile, this can cause jank. Add a `@Input() ftSubtleRevealReducedMotion` that falls back to simple fade for `prefers-reduced-motion` or low-performance detection.

3. **CountUp behavior change**: `micro-scale-fade` does NOT count from 0 to N. It shows the final value with a scale animation. If the user wants counting preserved, we need a custom WAAPI numeric animation (not from the catalog). This is a **UX decision**, not a technical one.

4. **CSS class conflicts**: The current `ScrollAnimateDirective` adds CSS classes (`scroll-animate`, `scroll-animate--fade-up`, etc.). These classes may be referenced in SCSS files. Search needed before removal.

5. **`@angular/animations` dead code**: The 6 unused triggers in `animations.ts` can be safely removed. `pageTransition` is used in `app.component.ts` for route transitions — keep it or replace with a WAAPI equivalent.

6. **IntersectionObserver cleanup**: Both existing directives have proper `ngOnDestroy` cleanup. The new directive must match this rigor.

7. **TDD overhead**: With strict TDD enabled, each of the 8 effect types needs its own test cases (initial state, on-viewport entry, animation playback, cleanup). This adds ~200-300 lines of test code.

## Split Recommendation

**Do NOT split.** This is a cohesive change that should be done as one SDD change because:
- All three systems are being replaced by one unified system
- Splitting would leave the codebase in an inconsistent state mid-migration
- The total scope (~28 files, ~400-500 lines of changes) fits within the 400-line review budget if done carefully
- The directive + tests is the main complexity; template changes are mechanical

**However**, if the review budget is a concern, split into two PRs:
1. **PR 1**: Create `FtSubtleReveal` directive + tests + export from index (no template changes yet)
2. **PR 2**: Migrate all templates and remove old directives

## Ready for Proposal

**Yes.** The exploration is complete with:
- Clear effect mapping for each UI element type
- Recommended technical approach (Option A: single parameterized directive)
- Full file impact analysis
- Identified risks with mitigations
- Split strategy if needed

The orchestrator should proceed to `sdd-propose` to scope the change formally.
