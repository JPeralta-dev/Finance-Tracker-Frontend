# Dashboard Specification

## Purpose

Defines the dashboard loading experience (skeleton states, shimmer animation, loading→ready transitions) and the scroll-reveal animation behavior for stat cards using the unified `FtSubtleReveal` directive with micro-scale-fade effect.

## Requirements

### Requirement: Stat Card Animation Style

The system SHALL use a micro-scale-fade effect (~600ms) for stat card numeric values instead of count-up from 0→N. The animation MUST preserve currency formatting (prefix/suffix) and apply a subtle scale transition from `0.97` to `1.0` with opacity `0.6` to `1.0`.
(Previously: Count-up animation from 0 to target value over 2500ms with quadratic easeOut)

#### Scenario: Dashboard stat cards animate on scroll into view

- GIVEN a stat card with a formatted currency value (e.g., "$12,450")
- WHEN the card enters the viewport via IntersectionObserver
- THEN the value appears with micro-scale-fade (~600ms) preserving the full formatted string

#### Scenario: No re-animation on re-render

- GIVEN the animation has already played
- WHEN the component re-renders without new data
- THEN the animation does not replay

### Requirement: Animation Duration

The system SHALL complete the numeric-settle animation in approximately 600ms (±50ms), replacing the previous 2500ms default.
(Previously: Default duration of 2500ms, configurable per-component)

#### Scenario: Numeric settle completes within budget

- GIVEN a stat card with `ftSubtleReveal="numeric-settle"`
- WHEN the animation triggers
- THEN it completes in approximately 600ms

### Requirement: Animation Triggers on Visibility

The system SHALL trigger the numeric-settle animation when the stat card becomes visible in the viewport, using `FtSubtleReveal` with `IntersectionObserver` instead of the legacy `CountUpDirective`.
(Previously: Triggered by CountUpDirective with its own visibility detection)

#### Scenario: Animation on initial load

- GIVEN user loads the dashboard
- WHEN stat cards enter the viewport
- THEN the numeric-settle animation plays once via FtSubtleReveal

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
