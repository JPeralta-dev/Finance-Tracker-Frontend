# Proposal: Animation Overhaul

## Intent

Unify three competing animation systems and remove 6 dead Angular triggers into a single WAAPI `FtSubtleReveal` directive.

## Scope

### In Scope
- `FtSubtleReveal` directive with 8-effect registry
- Migrate 17 templates, update 8 component imports
- Remove 6 dead triggers from `animations.ts` (keep `pageTransition`)
- Delete old directives: ScrollReveal, ScrollAnimate, CountUp
- Full TDD coverage (Karma + Jasmine)
- `prefers-reduced-motion` fallback

### Out of Scope
- `HoverDepthDirective`
- New effects beyond the 8-effect registry
- E2E visual regression tests

## Capabilities

### New Capabilities
- `scroll-animations`: Unified WAAPI scroll-reveal with parameterized effects, IntersectionObserver, reduced-motion

### Modified Capabilities
- `dashboard`: Count-up changes from "count 0→N, 2500ms" to "numeric-settle" (~600ms micro-scale-fade). Visibility trigger preserved.

## Approach

1. Create `FtSubtleRevealDirective` — `@Input('ftSubtleReveal') effect`, `@Input() delay`, `@Input() threshold`. IntersectionObserver + `element.animate()` with effect registry.
2. Effect mapping: headings → `text-crossfade`, cards → `scale-in`, containers → `fade-up`, hero → `text-blur-in`, stats → `numeric-settle`.
3. Migrate templates, remove old directives, clean `index.ts`, strip dead triggers.
4. TDD first: spec covers each effect (initial state, viewport entry, playback, cleanup, reduced-motion).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `shared/directives/ft-subtle-reveal.directive.ts` | New | WAAPI directive + effect registry |
| `shared/directives/ft-subtle-reveal.directive.spec.ts` | New | TDD for 8 effects |
| `shared/directives/scroll-reveal.directive.ts` | Removed | Replaced |
| `shared/directives/scroll-animate/` | Removed | Replaced |
| `shared/directives/count-up.directive.ts` | Removed | Replaced |
| `shared/directives/index.ts` | Modified | Export swap |
| `shared/animations.ts` | Modified | Remove 6 dead triggers |
| 9 templates + 8 component `.ts` | Modified | Selector + import swap |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Review exceeds 400-line budget | Medium | Split PR: (1) directive+tests, (2) migration+cleanup |
| `prefers-reduced-motion` gaps | Low | Explicit test per effect |
| CountUp behavior change rejected | Low | Flag in review; custom WAAPI fallback |
| Old CSS class conflicts | Low | Grep SCSS before removal |
| Per-character mobile jank | Medium | `text-blur-in` limited to landing hero |

## Rollback Plan

1. Rename old directives to `.deprecated.ts`, keep exports alongside new directive.
2. If issues arise, revert templates to old selectors.
3. Full git revert restores previous state. Old directives removed after 1 sprint of stability.

## Dependencies

- `animate-text` skill for WAAPI adapter mapping

## Success Criteria

- [ ] All 17 templates render with FtSubtleReveal effects per exploration mapping
- [ ] `ng test --no-watch --browsers=ChromeHeadless` passes
- [ ] `ng build --configuration production` succeeds
- [ ] `prefers-reduced-motion: reduce` disables all animations (tested)
- [ ] 6 dead triggers removed, no old directive references remain
