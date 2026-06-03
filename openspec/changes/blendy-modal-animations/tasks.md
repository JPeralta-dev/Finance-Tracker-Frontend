# Tasks: Blendy Modal Animations

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–850 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3/4 (parallel) → PR 5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | BlendyService + FtBlendyModalComponent + tests | PR 1 | Foundation, all other units depend on it |
| 2 | Categories modal integration | PR 2 | Base: main. First consumer, simpler scope |
| 3 | Transaction modal integration | PR 3 | Base: PR 1 branch. Depends on foundation |
| 4 | Notifications modal integration | PR 4 | Base: PR 1 branch. Can parallel with PR 3 |
| 5 | Polish & integration (a11y, reduced-motion, dead code) | PR 5 | Base: main after PR 2/3/4 merged |

## Phase 1: Foundation — BlendyService + FtBlendyModalComponent

- [x] 1.1 Create `src/app/shared/services/blendy.service.ts` — singleton, `afterNextRender` init, `toggle`/`untoggle`/`update` API, `prefersReducedMotion` signal
- [x] 1.2 Create `src/app/shared/components/blendy-modal/` — `FtBlendyModalComponent` standalone: `open` signal input, `blendyId` input, content projection, backdrop click, Escape key, single-wrapper enforcement
- [x] 1.3 Add `blendy` dependency to `package.json` — `npm install blendy`
- [x] 1.4 Write `blendy.service.spec.ts` — mock Blendy instance, verify toggle/untoggle calls, prefers-reduced-motion bypass, update calls
- [x] 1.5 Write `blendy-modal.component.spec.ts` — mock BlendyService, test signal→toggle flow, close callback, backdrop click, Escape key, open→close lifecycle

## Phase 2: Categories Consumer

- [ ] 2.1 Modify `categories.component.ts` — replace `showForm` signal direct usage to drive `<ft-blendy-modal [open]>`; import `FtBlendyModalComponent`
- [ ] 2.2 Modify `categories.component.html` — replace `.modal-overlay` + `.modal` block (lines 103–166) with `<ft-blendy-modal>` wrapping the form; add `data-blendy-from="category-trigger"` to "New" button and `data-blendy-from="cat-edit-{id}"` to each edit button
- [ ] 2.3 Update `categories.component.spec.ts` — add tests for modal open/close via Blendy, `data-blendy-from` presence, form submit closes modal
- [ ] 2.4 Verify: `ng test` passes, category create/edit still works

## Phase 3: Transaction Modal Consumer

- [ ] 3.1 Modify `transactions.page.ts` — add `showTransactionModal` signal, add import for `FtBlendyModalComponent`, handle `onModalClosed()` to refresh list
- [ ] 3.2 Modify `transactions.page.html` — replace `<a routerLink="/transactions/new">` with `<button (click)="showTransactionModal.set(true)">`; add `data-blendy-from="transaction-trigger"`; wrap `<ft-blendy-modal>` around `<ft-transaction-form>` in template; preserve `actionRoute` on empty-state for deep-link fallback
- [ ] 3.3 Modify `transaction-form.component.ts` — add `closed` output event; change success handler to emit close instead of `router.navigate`; add dirty-form warning on close attempt
- [ ] 3.4 Write `transactions.page.spec.ts` — test modal opens on button click, form renders inside modal, success closes modal, dirty form warning shows
- [ ] 3.5 Verify: `/transactions/new` route still works as fallback, `ng test` passes

## Phase 4: Notifications Modal Consumer

- [ ] 4.1 Modify `notifications-dropdown.component.ts` — remove `toggleDropdown`/`closeDropdown`/`ClickOutsideDirective`; keep `isOpen` signal to drive `<ft-blendy-modal>`
- [ ] 4.2 Modify `notifications-dropdown.component.html` — replace `@if (isOpen())` panel (lines 14–50) with `<ft-blendy-modal>` wrapping notification list; add `data-blendy-from="notifications-trigger"` to bell button
- [ ] 4.3 Update `notifications-dropdown.component.spec.ts` — update tests for modal behavior, remove dropdown-specific tests, add modal open/close coverage
- [ ] 4.4 Verify: notification state (read/unread, dismiss) still works, `ng test` passes

## Phase 5: Polish & Integration

- [ ] 5.1 Add `.reduced-motion` CSS class handling across all modals — instant show/hide when `prefersReducedMotion` is true
- [ ] 5.2 Accessibility pass — verify `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus management on open/close, screen reader announcements for notifications count
- [ ] 5.3 Remove dead code — delete old `.modal-overlay` styles from CategoriesComponent, remove `ClickOutsideDirective` import from notifications if no longer used elsewhere
- [ ] 5.4 Integration sweep — open/close each modal, verify no console errors, no layout shift, animations play (or bypass with reduced motion)
