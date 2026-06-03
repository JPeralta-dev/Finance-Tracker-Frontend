# Blendy Integration Specification

## Purpose

Core infrastructure for Blendy-powered modal animations: singleton service, reusable wrapper component, accessibility, and animation lifecycle guarantees.

## Requirements

### Requirement: BlendyService Singleton

The system SHALL provide a root-level singleton `BlendyService` managing a single Blendy instance with toggle/untoggle/update API.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Initialization | App bootstrapped | Service injected | Blendy instance created in `afterNextRender` with `animation: 'dynamic'` |
| toggle() | Valid Blendy ID in DOM | `toggle(id)` called | Animate from `data-blendy-from` to `data-blendy-to` |
| untoggle() | Modal toggled open | `untoggle(id, cb)` called | Reverse animation; callback fires ONLY after completion |
| update() | Modal open, content changes | `update()` called | Blendy recalculates wrapper dimensions |
| prefersReducedMotion() | OS has `prefers-reduced-motion: reduce` | Method called | Returns `true`; wrapper bypasses Blendy |

### Requirement: FtBlendyModalComponent Wrapper

The system SHALL provide a standalone wrapper component that encapsulates Blendy lifecycle, enforces single-wrapper constraint, and projects content.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Open animation | `open` signal changes false→true | Signal updates | `toggle(blendyId)` called; backdrop visible; focus moves inside |
| Close animation | `open` signal changes true→false | Signal updates | `untoggle(id, cb)` called; cb sets closed state; `close` emits; focus restored |
| Single-wrapper | Component renders | DOM inspected | Exactly one `data-blendy-to` element; contains `ng-content` |
| Backdrop click | Modal open | Backdrop clicked | Modal closes via untoggle; projected content not clicked |
| Escape key | Modal open, has focus | Escape pressed | Modal closes via untoggle |
| ARIA | Modal rendered | DOM inspected | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` set |

### Requirement: Focus Management

The system SHALL trap focus inside the modal while open and restore focus to the trigger on close.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Focus trap | Modal open | Tab on last focusable element | Focus wraps to first element; does not escape |
| Focus restore | Modal opened by trigger button | Modal closes (any method) | Focus returns to trigger button |

### Requirement: prefers-reduced-motion Bypass

The system SHALL skip Blendy animations when the user's OS requests reduced motion.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Bypass active | `prefers-reduced-motion: reduce` set | Modal opens/closes | Instant show/hide, no animation |
| Animation enabled | Preference NOT set to reduce | Modal opens/closes | Blendy dynamic animation used |

### Requirement: Animation Completion Guarantees

The system SHALL ensure Angular signal updates occur ONLY after animations complete to prevent race conditions.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Signal timing | Modal open (`open=true`) | Parent sets `open=false` | Internal state updates ONLY in untoggle callback |
| No layout shift | Animation in progress | During animation | No page reflow; no console errors |
