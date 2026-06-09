# Skeleton Loading Specification

## Purpose

Define the unified skeleton loading system for the dashboard: complete skeleton coverage across all sections, consistent shimmer animation, and smooth loading→ready state transitions.

## Requirements

### Requirement: Stat Card Skeleton Height Match

The stat card skeleton MUST render with a footer placeholder that matches the real card's computed height, including the trend and insight footer section (~30px).

#### Scenario: Skeleton footer renders with matching dimensions

- GIVEN the dashboard is in loading state
- WHEN the stats grid renders skeleton cards
- THEN each skeleton card includes a footer placeholder element below the value skeleton
- AND the total skeleton card height equals the real card height (header + value + footer + padding)
- AND no layout shift occurs when loading transitions to ready

#### Scenario: Footer skeleton includes trend and insight placeholders

- GIVEN a stat card skeleton is rendering
- WHEN the footer section is displayed
- THEN a trend placeholder bar (width ~60px, height ~20px) is visible
- AND an insight placeholder bar (width ~80px, height ~14px) is visible
- AND both placeholders use the shared shimmer animation

#### Scenario: Skeleton height remains consistent across breakpoints

- GIVEN the viewport changes from mobile (<768px) to desktop (≥768px)
- WHEN skeleton cards are displayed
- THEN the skeleton footer dimensions scale proportionally to match real card breakpoints
- AND the height match is preserved at all breakpoints

### Requirement: Full Page Skeleton Coverage

All dashboard sections MUST render skeleton placeholders during the loading state: stats grid, area chart, recent activity, donut chart, and insights panel.

#### Scenario: All sections show skeletons simultaneously during loading

- GIVEN the dashboard page enters loading state
- WHEN the loading block renders
- THEN the stats grid shows 4 skeleton cards
- AND the area chart shows a skeleton with 6 bars
- AND the recent activity shows 4 skeleton rows
- AND the donut chart shows a skeleton ring
- AND the insights panel shows a skeleton placeholder
- AND all skeletons use the same shimmer animation

#### Scenario: Skeleton sections match real content layout

- GIVEN all skeleton sections are rendering
- WHEN comparing skeleton layout to ready-state layout
- THEN the skeleton grid/column structure matches the real content structure
- AND skeleton sections occupy the same CSS grid areas as their real counterparts
- AND the visual skeleton structure mirrors the real content hierarchy

#### Scenario: Chart components use existing loading input

- GIVEN the area-chart and donut-chart components support `[loading]` input
- WHEN the dashboard is in loading state
- THEN both chart components render with `[loading]="true"`
- AND their internal skeleton templates display instead of the canvas

### Requirement: Cross-Fade State Transition

The transition from loading state to ready state MUST use a cross-fade animation (opacity + transform) with existing easing tokens, not an instant swap.

#### Scenario: Loading-to-ready cross-fade animation plays

- GIVEN the dashboard transitions from loading to ready state
- WHEN the data finishes loading
- THEN the skeleton content fades out (opacity 1→0) over `--duration-normal`
- AND the real content fades in (opacity 0→1) over `--duration-normal`
- AND both use `--ease-out` easing curve
- AND the animation is visible to the user (not instant)

#### Scenario: No layout shift during transition

- GIVEN the cross-fade animation is playing
- WHEN skeleton and real content overlap during transition
- THEN no visual layout shift or content jump occurs
- AND the skeleton uses absolute positioning overlay during the fade
- AND the real content occupies the same layout space

#### Scenario: ftSubtleReveal animations are not broken

- GIVEN the cross-fade transition completes
- WHEN the ready state content appears
- THEN existing `ftSubtleReveal="fade-up"` animations still trigger on greeting, stats, and content sections
- AND the cross-fade does not interfere with or override ftSubtleReveal timing
- AND reveal delays (100ms, 150ms, 200ms, 300ms) are preserved

### Requirement: Unified Shimmer Animation

The system MUST use a single shimmer animation implementation from `_skeleton.scss` (opacity pulse). The gradient sweep in `skeleton.component.ts` MUST be removed.

#### Scenario: All skeleton elements use shared opacity pulse

- GIVEN any skeleton element renders (stat cards, charts, activity, donut, insights)
- WHEN the shimmer animation plays
- THEN the animation is `shimmer` from `_skeleton.scss` (opacity 0.3→0.6, 1.5s, ease-in-out, infinite alternate)
- AND no gradient-based shimmer animation is used anywhere

#### Scenario: Gradient sweep is removed from skeleton component

- GIVEN the `skeleton.component.ts` file is reviewed
- WHEN the component styles are inspected
- THEN no `linear-gradient` background or `background-position` animation exists
- THEN the component either uses the shared `_skeleton.scss` animation or is deprecated
- AND no duplicate shimmer keyframe definitions exist in the codebase

#### Scenario: New skeleton consumers use shared animation

- GIVEN a developer adds a new skeleton placeholder
- WHEN they apply the `.skeleton-block` class or skeleton modifier classes
- THEN the shared shimmer animation is automatically applied
- AND no custom animation keyframes are needed

## Acceptance Criteria

| # | Criteria | Verification |
|---|----------|-------------|
| AC1 | Stat card skeleton height matches real card including footer | Visual diff test or pixel comparison |
| AC2 | All 5 dashboard sections show skeletons during loading | Manual inspection or E2E test |
| AC3 | Cross-fade animation is visible (≥300ms duration) | Manual inspection or performance trace |
| AC4 | Single shimmer animation source in codebase | Grep for `@keyframes shimmer` — only 1 definition |
| AC5 | No layout shift during loading→ready transition | CLS metric = 0 in DevTools |
| AC6 | ftSubtleReveal animations still work after transition | Manual inspection of reveal effects |
| AC7 | Gradient sweep removed from skeleton.component.ts | Code review of component styles |

## Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| Fast network (loading < 200ms) | Cross-fade still plays; no flicker |
| Slow network (loading > 5s) | Skeleton animation continues smoothly; no performance degradation |
| Skeleton renders without footer data | Footer skeleton still renders (placeholder only, no real data needed) |
| Browser without backdrop-filter support | Skeleton still renders; glass effect degrades gracefully |
| Component used outside dashboard | Skeleton styles are self-contained; no dashboard-specific dependencies |
