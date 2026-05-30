# scroll-animations Specification

## Purpose

Defines the unified WAAPI-based scroll-reveal directive system (`FtSubtleReveal`) with an 8-effect registry, IntersectionObserver triggering, and `prefers-reduced-motion` compliance.

## Requirements

### Requirement: Effect Registry

The system SHALL maintain a registry of 8 named animation effects, each producing deterministic WAAPI keyframes. The registry MUST support: `text-crossfade`, `scale-in`, `fade-up`, `text-blur-in`, `numeric-settle`, `stagger-fade`, `slide-in`, and `fade-in`.

#### Scenario: Registry returns valid keyframes for each effect

- GIVEN an effect name from the registry
- WHEN the directive requests its keyframe contract
- THEN it returns a valid WAAPI keyframe array with `from`/`to` states

#### Scenario: Unknown effect name throws

- GIVEN an effect name not in the registry
- WHEN the directive requests its keyframes
- THEN it throws a descriptive error naming the unknown effect

### Requirement: WAAPI Animation Execution

The system SHALL use `element.animate()` (Web Animations API) for all effect playback. Animations MUST NOT rely on Angular `@trigger` state transitions or CSS `@keyframes`.

#### Scenario: Heading reveal with text-crossfade

- GIVEN an element with `ftSubtleReveal="text-crossfade"`
- WHEN the element enters the viewport
- THEN `element.animate()` is called with crossfade keyframes and completes within 700ms

#### Scenario: Container entrance with fade-up

- GIVEN a container with `ftSubtleReveal="fade-up"`
- WHEN the container enters the viewport
- THEN the element animates from `opacity:0, translateY(16px)` to `opacity:1, translateY(0)`

### Requirement: IntersectionObserver Trigger

The system SHALL use `IntersectionObserver` to detect when elements enter the viewport. Each directive instance MUST create its own observer entry or share a singleton observer. Animations MUST play only once per element lifecycle.

#### Scenario: List item stagger on scroll

- GIVEN three sibling elements with `ftSubtleReveal` and stagger delays of 0ms, 80ms, 160ms
- WHEN all three enter the viewport simultaneously
- THEN each animates in sequence with its configured delay offset

#### Scenario: Animation plays once

- GIVEN an element that has already animated
- WHEN it leaves and re-enters the viewport
- THEN the animation does NOT replay

### Requirement: prefers-reduced-motion Support

The system SHALL respect `prefers-reduced-motion: reduce` media query. When active, all effects MUST skip animation and apply final keyframe state immediately (no transition).

#### Scenario: Reduced-motion fallback

- GIVEN `prefers-reduced-motion: reduce` is active
- WHEN any element with `ftSubtleReveal` enters the viewport
- THEN the element appears in its final visible state with zero animation duration

#### Scenario: Normal motion when preference is absent

- GIVEN `prefers-reduced-motion` is NOT set to `reduce`
- WHEN an element enters the viewport
- THEN the full WAAPI animation plays as configured

### Requirement: Parameterized Inputs

The system SHALL accept `@Input('ftSubtleReveal') effect: string`, `@Input() delay: number = 0`, and `@Input() threshold: number = 0.1`. These inputs MUST be evaluated before the first IntersectionObserver callback.

#### Scenario: Custom delay shifts animation start

- GIVEN an element with `ftSubtleReveal="scale-in" [delay]="200"`
- WHEN the element enters the viewport
- THEN the animation starts 200ms after the intersection callback fires

#### Scenario: Custom threshold changes trigger point

- GIVEN an element with `ftSubtleReveal="fade-up" [threshold]="0.5"`
- WHEN the element is 50% visible in the viewport
- THEN the animation triggers at that visibility ratio

### Requirement: Directive Cleanup

The system SHALL disconnect its IntersectionObserver and cancel any in-flight WAAPI animations when the directive is destroyed (Angular `ngOnDestroy`).

#### Scenario: Cleanup on component destroy

- GIVEN a component with `FtSubtleReveal` is destroyed
- WHEN `ngOnDestroy` fires
- THEN the IntersectionObserver is disconnected and no pending animations remain
