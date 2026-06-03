# Exploration: Blendy Modal Animations

## Blendy API Summary

**What it is**: A framework-agnostic vanilla JS library (~5-8KB minified, 20KB unpacked) that smoothly transitions one element into another by measuring the source and animating the target to match.

**Installation**: `npm install blendy` or CDN via unpkg.

**Core API**:
- `createBlendy({ animation: 'dynamic' | 'spring' })` — creates an instance
- `blendy.toggle(id)` — triggers the expand/open animation
- `blendy.untoggle(id, callback)` — triggers the collapse/close animation; callback fires AFTER animation completes
- `blendy.update()` — re-scans DOM for new elements (needed for dynamically added content)

**How it works**:
1. Source element has `data-blendy-from="my-id"`
2. Target element has `data-blendy-to="my-id"`
3. Both source and target MUST wrap their content in a **single child element**
4. Blendy measures the source's dimensions/position and animates the target from that starting point

**Animation types**:
- `'dynamic'` (default) — smooth easing-based transition
- `'spring'` — spring physics-based bounce

**Framework examples**: React and Vue examples exist. No Angular example. The pattern is:
- Create Blendy instance in `ngOnInit`/`AfterViewInit`
- Call `toggle()` when showing, `untoggle(callback)` when hiding
- Wait for `untoggle` callback before removing element from DOM

## Modal Inventory

| # | Component | Type | Location | Open/Close Mechanism | Current Animation |
|---|-----------|------|----------|---------------------|-------------------|
| 1 | **Category form** | True modal (overlay + backdrop) | `features/categories/categories.component.html` (lines 103-167) | `showForm` signal, `openCreateForm()`/`closeForm()` | None (instant show/hide via `@if`) |
| 2 | **Transaction form** | Route/page (NOT a modal) | `features/transactions/transaction-form.component.*` | Router navigation to `/transactions/new` or `/transactions/:id` | `ftSubtleReveal` directive (fade-up) |
| 3 | **Notifications dropdown** | Dropdown panel (NOT a modal) | `shared/layout/notifications-dropdown/notifications-dropdown.component.*` | `isOpen` signal, `toggleDropdown()`/`closeDropdown()` | CSS `@keyframes dropdownFade` (0.15s fade + slide) |
| 4 | **Command palette** | Overlay/modal-like | `shared/ui/command-palette/command-palette.component.*` | `CommandService.open` signal | CSS `@keyframes fadeIn` + `scaleIn` (0.2s) |
| 5 | **Profile dropdown** | Dropdown menu (NOT a modal) | `shared/layout/profile-dropdown/profile-dropdown.component.*` | `isOpen` signal | None (instant via `@if`) |

### Critical Discovery: Transaction Form is NOT a Modal

The user asked to animate a "modal de registrar una transacción", but the transaction form is a **full page route** (`/transactions/new`), not a modal. To fulfill this request, we would first need to **convert the transaction form from a page to a modal** — which is a significant UX change beyond just adding animations.

## Affected Areas

- `features/categories/categories.component.{html,ts,scss}` — Category modal, the only true modal
- `shared/layout/notifications-dropdown/notifications-dropdown.component.{html,ts,scss}` — Notifications dropdown
- `shared/ui/command-palette/command-palette.component.{html,ts,scss}` — Command palette overlay
- `package.json` — Add `blendy` dependency
- **New file**: `shared/services/blendy.service.ts` — Singleton Blendy instance manager
- **New file**: `shared/components/blendy-modal/blendy-modal.component.ts` — Reusable wrapper (recommended approach)

## Integration Approaches

### Approach 1: Reusable BlendyModal Wrapper Component (Recommended)

Create a standalone `BlendyModalComponent` that encapsulates Blendy logic:

```typescript
// Usage in template:
<ft-blendy-modal
  [open]="showForm()"
  blendyId="category-modal"
  (close)="closeForm()"
>
  <!-- modal content -->
</ft-blendy-modal>
```

**Pros**:
- Single point of Blendy integration
- Consistent animation across all modals
- Easy to swap out Blendy later if needed
- Handles the `untoggle` callback → signal timing correctly
- Manages single-wrapper requirement internally

**Cons**:
- Requires refactoring existing modal templates to use the wrapper
- Adds one more component to the shared library

**Effort**: Medium

### Approach 2: Direct Per-Component Integration

Inject Blendy directly into each component that has a modal:

```typescript
// In each component:
private blendy = inject(BlendyService);
// Call blendy.toggle('my-id') / blendy.untoggle('my-id', () => ...)
```

**Pros**:
- More control per component
- No wrapper abstraction layer

**Cons**:
- Duplicated Blendy logic across components
- Each component must handle the single-wrapper requirement
- Harder to maintain and swap out later
- More error-prone (forgetting `untoggle` callback timing)

**Effort**: Medium-High (more total work due to duplication)

### Approach 3: CSS-Only Alternative (No Blendy)

Use Angular's native Web Animations API (already used in `ftSubtleReveal`) or CSS transitions to achieve similar effects.

**Pros**:
- Zero dependencies
- Already have animation infrastructure (`shared/animations.ts`, `ftSubtleReveal`)
- Full control over animation curves

**Cons**:
- Won't get Blendy's "morph from source element" effect
- Requires writing custom animation logic

**Effort**: Low-Medium

## Recommendation

**Approach 1 (Reusable Wrapper)** is the best path forward. Here's why:

1. **Blendy's unique value** is the "morph from trigger button" effect — a wrapper component can expose this cleanly
2. The app currently has **only 1 true modal** (category form). The notifications dropdown and command palette are different UI patterns (dropdown/overlay). Blendy is best suited for modal overlays, not dropdowns.
3. The transaction form being a page is a **separate decision** — if the user wants it as a modal, that's a UX change that should be its own task.

### Proposed Migration Strategy

**Phase 1: Infrastructure** (1 session)
- Install `blendy` via npm
- Create `BlendyService` (singleton, provides `createBlendy()` instance)
- Create `BlendyModalComponent` (standalone, handles toggle/untoggle lifecycle)

**Phase 2: Category Modal** (1 session)
- Replace the `@if (showForm())` block in `categories.component.html` with `<ft-blendy-modal>`
- Wire up open/close through the wrapper
- Remove manual `modal-overlay` SCSS (wrapper provides it)

**Phase 3: Notifications Dropdown** (optional, 1 session)
- Decide if notifications should become a modal or stay as dropdown
- If modal: wrap with `ft-blendy-modal`
- If dropdown: add CSS transition improvements (not Blendy's strength)

**Phase 4: Command Palette** (optional, 1 session)
- Similar decision as notifications
- The command palette already has CSS animations that work well

**What NOT to do in this change**:
- Do NOT convert the transaction form page to a modal — that's a separate UX decision
- Do NOT animate dropdowns with Blendy — Blendy is designed for modal/overlay transitions, not dropdown panels

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Blendy is v0.0.1** (very early) | Medium | Pin exact version, have CSS fallback ready |
| **Angular SSR compatibility** | Low | App is SPA (Vercel static), no SSR used |
| **`untoggle` callback timing** | Medium | Wrapper component must handle this correctly — signal must update AFTER callback fires |
| **Single-wrapper requirement** | Low | Wrapper component enforces this internally |
| **Conflict with `@angular/animations`** | Low | Blendy uses Web Animations API directly, no conflict with Angular's animation module |
| **Bundle size** | Negligible | ~5-8KB minified, tree-shakeable |
| **`prefers-reduced-motion`** | Medium | Blendy doesn't appear to respect this — wrapper should check and skip animation |

## Current Animation Patterns in the App

- **`ftSubtleReveal` directive** — Web Animations API, IntersectionObserver-based, 8 effects registered
- **`@pageTransition`** — Angular `@angular/animations` trigger for route transitions
- **CSS `@keyframes`** — Used in command-palette (`fadeIn`, `scaleIn`), notifications (`dropdownFade`)
- **CSS `transition`** — Used extensively for hover states, color changes, transforms

Blendy would add a **4th animation mechanism** to the codebase. This is acceptable if the "morph from source" effect is desired, but worth noting for maintainability.

## Ready for Proposal

**Yes** — the exploration is complete and actionable. The orchestrator should tell the user:

1. Only 1 true modal exists (category form). The transaction form is a page, not a modal.
2. Blendy can be integrated via a reusable wrapper component.
3. The scope should be clarified: animate the existing category modal only, or also convert transaction form to a modal?
4. Notifications dropdown and command palette are different patterns — Blendy may not be the best fit for those.
