# Dashboard Specification

## Purpose

Defines the scroll-reveal animation behavior for dashboard stat cards using the unified `FtSubtleReveal` directive with micro-scale-fade effect, replacing the legacy count-up animation system.

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
