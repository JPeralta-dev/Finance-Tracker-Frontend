# Design: Animation Overhaul

## Technical Approach

Unify three competing Angular animation directives (`ScrollRevealDirective`, `ScrollAnimateDirective`, `CountUpDirective`) into a single `FtSubtleRevealDirective` backed by a WAAPI effect registry. The directive uses `IntersectionObserver` to trigger one-shot enter animations via `element.animate()`, consulting the effect registry for per-effect keyframes and timing. `prefers-reduced-motion` instantly resolves elements to final visible state without animation.

## Architecture Decisions

### Decision: WAAPI over Angular Animations or CSS scroll-timeline

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Angular Animations (`@angular/animations`) | Powers existing `pageTransition`, requires full animation system | Keep only `pageTransition`; too heavy for directive-level use |
| CSS scroll-timeline | Native, no JS, but browser support uneven + no per-element control | IntersectionObserver fallback only; WAAPI for precision |
| WAAPI (`element.animate()`) | Native, zero deps, `fill: 'forwards'` gives state retention, precise control | **Use WAAPI** |

**Rationale**: The project already uses Renderer2/CSS for scroll animations (ScrollReveal, ScrollAnimate). WAAPI is native, zero-dependency, and gives precise control over keyframes, timing, and fill behavior. Aligns with the `animate-text` skill's WAAPI adapter mapping.

### Decision: Effect registry as injectable Map (not decorator-based)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Decorator-based (`@Effect('fade-up')`) | Compile-time, less flexible | Loses effect isolation |
| Map-based registry | Runtime lookup, tree-shakeable if entries are unused | **Use Map<string, EffectDefinition>** |

**Rationale**: Each of the 8 effects needs distinct keyframes + timing. A `Map<string, EffectDefinition>` allows runtime lookup by name while keeping the directive itself stateless. Effects are pre-registered at module load; unused effects are tree-shakeable.

### Decision: DOM wrapping strategy for per-unit effects

| Target | Strategy | Effects using |
|--------|----------|---------------|
| `whole` | No wrap — animate host element directly | `micro-scale-fade`, `shimmer-sweep`, `scale-down-fade` |
| `per-word` | Split on `/\S+/g`, wrap words in `<span class="ft-word">` | `per-word-crossfade`, `short-slide-right` |
| `per-character` | Split on `Array.from()`, wrap chars in `<span class="ft-char">` | `soft-blur-in`, `typewriter` |

**Rationale**: The `animate-text` skill defines `target` (whole/per-word/per-character). Effects with stagger need unit-level spans. Whole-target effects (no stagger) animate the host element directly — no DOM manipulation overhead.

## Data Flow

```
Component Template
    │
    ▼
[FtSubtleRevealDirective] ─── inputs: effect name, delay, threshold, stagger
    │
    ├── ngOnInit:
    │   ├── reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    │   ├── If reducedMotion → set element visible, return
    │   ├── EffectDefinition = EFFECT_REGISTRY.get(effectName)
    │   ├── If target === 'per-word'|'per-character' → wrapTextUnits(hostEl, target)
    │   └── IntersectionObserver.observe(hostEl)
    │
    ▼
[IntersectionObserver fires: isIntersecting]
    │
    ├── For each animated unit (span or host):
    │   └── element.animate(keyframes, { delay: baseDelay + rank*stagger, duration, easing, fill: 'forwards' })
    │       └── await animation.finished (one-shot, no loop)
    └── observer.unobserve(hostEl)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/shared/directives/ft-subtle-reveal.directive.ts` | Create | Main directive + EffectDefinition types + EFFECT_REGISTRY Map |
| `src/app/shared/directives/ft-subtle-reveal.directive.spec.ts` | Create | TDD: directive lifecycle, 8 effects, reduced-motion, cleanup |
| `src/app/shared/directives/scroll-reveal.directive.ts` | Delete | Replaced by ft-subtle-reveal |
| `src/app/shared/directives/scroll-animate/scroll-animate.directive.ts` | Delete | Replaced by ft-subtle-reveal |
| `src/app/shared/directives/scroll-animate/` | Delete | Entire directory removed |
| `src/app/shared/directives/count-up.directive.ts` | Delete | Replaced by ft-subtle-reveal="micro-scale-fade" |
| `src/app/shared/directives/index.ts` | Modify | Export swap: remove ScrollReveal/ScrollAnimate/CountUp, add FtSubtleRevealDirective |
| `src/app/shared/animations.ts` | Modify | Remove 6 dead triggers: `fadeSlideIn`, `staggerList`, `cardEntrance`, `rowEntrance`, `drawerSlide`, `counterPop`; keep `pageTransition` |
| `src/app/features/dashboard/dashboard.page.html` | Modify | `ftScrollReveal` → `ftSubtleReveal="fade-up"` |
| `src/app/features/analytics/pages/analytics.page.html` | Modify | `ftScrollReveal` → `ftSubtleReveal="fade-up"` |
| `src/app/features/dashboard/components/stat-card/stat-card.component.ts` | Modify | `ftCountUp` → `ftSubtleReveal="micro-scale-fade"` + pre-set numeric value |
| `src/app/features/{landing,categories,transactions,settings}/*.html` | Modify | `ftScrollAnimate` → `ftSubtleReveal="fade-up"` |

## Interfaces / Contracts

```typescript
// src/app/shared/directives/ft-subtle-reveal.directive.ts

export type AnimationTarget = 'whole' | 'per-word' | 'per-character';

export interface EffectDefinition {
  target: AnimationTarget;
  keyframes: Keyframe[];
  duration: number;          // ms
  easing: string;            // CSS easing string
  stagger: number;           // ms between units (0 for whole)
  fill: FillMode;            // 'forwards' | 'none'
}

export const EFFECT_REGISTRY: Map<string, EffectDefinition> = new Map([
  ['soft-blur-in',    { target: 'per-character', keyframes: [...], duration: 648, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', stagger: 18, fill: 'forwards' }],
  ['per-word-crossfade', { target: 'per-word', keyframes: [...], duration: 504, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', stagger: 50, fill: 'forwards' }],
  ['micro-scale-fade', { target: 'whole', keyframes: [...], duration: 432, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', stagger: 0, fill: 'forwards' }],
  ['fade-up',         { target: 'whole', keyframes: [...], duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', stagger: 0, fill: 'forwards' }],
  ['typewriter',      { target: 'per-character', keyframes: [...], duration: 173, easing: 'steps(1, end)', stagger: 33, fill: 'forwards' }],
  ['shimmer-sweep',   { target: 'whole', keyframes: [...], duration: 612, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', stagger: 0, fill: 'forwards' }],
  ['short-slide-right', { target: 'per-word', keyframes: [...], duration: 374, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', stagger: 66, fill: 'forwards' }],
  ['scale-down-fade', { target: 'whole', keyframes: [...], duration: 374, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', stagger: 0, fill: 'forwards' }],
]);
```

Keyframe values are sourced from the `animate-text` skill's `showcase.timing.scaled_*` and `portable_spec.enter.from/to` fields. The `speed_multiplier: 0.72` is pre-applied in the registry.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Directive instantiates with each of 8 effects | TestBed + 8 spec cases, assert `animation` property set |
| Unit | IntersectionObserver fires → `element.animate()` called | Spy on `element.animate`, trigger observer callback manually |
| Unit | `prefers-reduced-motion: reduce` → no animation, element immediately visible | Spy on `matchMedia`, override to `{ matches: true }` |
| Unit | Effect not found → no-op (silent fail) | Pass unknown effect name, verify no observer or animate call |
| Unit | `ngOnDestroy` → observer.disconnect() called | Spy on `observer.disconnect` |
| Unit | Stagger calculation: `delay = delayInput + rank * stagger` | Mock multiple animated units, verify each gets correct delay |
| Integration | Dashboard page renders with new animations | TestBed with FtSubtleRevealDirective imported, fixture.detectChanges |

## Migration / Rollout

**Phase 1 — Directive + Tests** (PR #1, ~150 lines):
1. Create `ft-subtle-reveal.directive.ts` with empty EFFECT_REGISTRY
2. Add 8 effects to registry, one per ticket
3. Write full spec suite (TDD: RED first)
4. Verify `ng test --no-watch --browsers=ChromeHeadless` passes

**Phase 2 — Migration + Cleanup** (PR #2, ~250 lines):
1. Update 9 templates: selector swap + import swaps
2. Remove `ScrollRevealDirective`, `ScrollAnimateDirective`, `CountUpDirective` files
3. Remove dead triggers from `animations.ts`
4. Update `index.ts` exports
5. Full build + e2e smoke

**Rollback**: Rename old directives to `.deprecated.ts` during Phase 2, keep exports alongside new directive. Full git revert restores previous state.

## Open Questions

- [ ] `typewriter` effect uses `steps(1, end)` easing. Safari < 16.4 has partial steps() support. Should we add a fallback for older Safari, or is this acceptable for the target browser matrix?
- [ ] `soft-blur-in` is `per-character` with 18ms stagger. For long headings (>40 chars), the `animate-text` skill recommends switching to `per-word`. Should we auto-detect and switch target, or require explicit `ftSubtleReveal="per-word-crossfade"` for long copy?