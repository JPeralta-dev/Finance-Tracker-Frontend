# Tasks: Animation Overhaul

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450-550 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Directive + Tests → PR 2: Migration + Cleanup |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

**Note**: 2-PR split matches exploration recommendation. PR1 base = `feature/animation-overhaul` (tracker branch), PR2 base = PR1 branch. Per-spec scenario "unknown effect throws" → design chose silent no-op; PR1 implements design choice. Effect names from design doc (animate-text skill sources), not earlier spec draft names.

### Suggested Work Units

| Unit | Goal | Likely PR | Base Boundary |
|------|------|-----------|---------------|
| 1 | Core directive + registry + spec suite | PR 1 | feature/animation-overhaul |
| 2 | Template migrations + old directive cleanup | PR 2 | PR 1 branch |

## Phase 1: Directive + Registry (PR 1, ~350-400 lines)

- [x] 1.1 Create `ft-subtle-reveal.directive.ts` with `EffectDefinition` type, `AnimationTarget`, and `EFFECT_REGISTRY` Map (8 effects from animate-text skill keyframes)
- [x] 1.2 `FtSubtleRevealDirective` class: `@Input('ftSubtleReveal') effect`, `@Input() delay`, `@Input() threshold`, IntersectionObserver trigger, one-shot playback guard
- [x] 1.3 WAAPI playback: `element.animate()` with per-effect keyframes; `prefers-reduced-motion` guard → instant final-state reveal
- [x] 1.4 `wrapTextUnits()` for per-word/per-character DOM splitting; stagger delay calc (`delay = baseDelay + rank * stagger`)
- [x] 1.5 `ngOnDestroy`: `observer.disconnect()` + cancel pending WAAPI animations
- [x] 1.6 Write TDD spec (RED first): 8 effect scenarios + reduced-motion + unknown effect no-op + stagger + cleanup
- [x] 1.7 Update `shared/directives/index.ts` to export `FtSubtleRevealDirective`
- [x] 1.8 Verify `pnpm test:ci` passes, `ng build --configuration production` succeeds

## Phase 2: Migration + Cleanup (PR 2, ~150-200 lines)

- [x] 2.1 Migrate 9 templates: `ftScrollReveal` → `ftSubtleReveal="fade-up"`, `ftCountUp` → `ftSubtleReveal="micro-scale-fade"`, `ftScrollAnimate` → `ftSubtleReveal`
- [x] 2.2 Update 8 component `.ts` imports: replace old directive imports with `FtSubtleRevealDirective`
- [x] 2.3 Remove old directives: `scroll-reveal.directive.ts`, `scroll-animate/` dir, `count-up.directive.ts`
- [x] 2.4 Remove 6 dead triggers from `animations.ts` (`fadeSlideIn`, `staggerList`, `cardEntrance`, `rowEntrance`, `drawerSlide`, `counterPop`); keep `pageTransition`
- [x] 2.5 Clean `index.ts` exports: remove `ScrollRevealDirective`, `ScrollAnimateDirective`, `CountUpDirective`
- [x] 2.6 Final verification: `pnpm test:ci` + `ng build --configuration production`
