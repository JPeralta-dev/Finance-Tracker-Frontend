# Design: Blendy Modal Animations

## Technical Approach

Wrap all modal-like UI (category form, transaction form, notifications) behind a single `FtBlendyModalComponent` that manages Blendy's lifecycle. The component exposes a signal-driven `open` input and fires a `closed` event when the user dismisses the modal. Blendy handles the element-to-element morph animation; when `prefers-reduced-motion` is active, the service bypasses Blendy and relies on CSS transitions applied via a `.reduced-motion` class.

## Architecture Decisions

### Decision 1: BlendyService — Singleton with afterNextRender initialization

**Choice**: `providedIn: 'root'`, initialized via `afterNextRender` to avoid SSR issues and ensure DOM is ready.

**Alternatives considered**:
- `APP_INITIALIZER`: too early, DOM not ready
- `ngOnInit` direct call: may run before view is inserted

**Rationale**: `afterNextRender` guarantees Blendy attaches after Angular's first render pass, which is when the trigger elements exist in the DOM.

```typescript
// blendy.service.ts
@Injectable({ providedIn: 'root' })
export class BlendyService {
  private blendy: any;
  readonly prefersReducedMotion = signal(false);

  constructor() {
    afterNextRender(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion.set(prefersReduced.matches);
      prefersReduced.addEventListener('change', (e) => this.prefersReducedMotion.set(e.matches));

      if (!prefersReduced.matches) {
        this.blendy = createBlendy({ animation: 'dynamic' });
      }
    });
  }

  toggle(id: string): void {
    if (this.prefersReducedMotion()) return;
    this.blendy?.toggle(id);
  }

  untoggle(id: string, callback: () => void): void {
    if (this.prefersReducedMotion()) {
      callback();
      return;
    }
    this.blendy?.untoggle(id, callback);
  }

  update(id: string): void {
    this.blendy?.update(id);
  }
}
```

### Decision 2: FtBlendyModalComponent — enforces single-wrapper constraint internally

**Choice**: The component template contains exactly ONE wrapper element with `data-blendy-to`. The `backdrop + container` sit inside this wrapper so Blendy can find the morph target.

**Structure**:
```html
<!-- Host element: blendy-target div -->
<div class="blendy-target" [attr.data-blendy-to]="blendyId">
  <div class="blendy-backdrop" (click)="close()"></div>
  <div class="blendy-container" role="dialog" aria-modal="true">
    <ng-content></ng-content>
  </div>
</div>
```

**Enforcement**: Angular's `@if` + structural directives ensure only one `.blendy-target` exists at a time. The component never renders `ng-content` outside this structure.

**Inputs**:
- `open: Signal<boolean>` — the signal that drives modal visibility
- `blendyId: string` — used as `data-blendy-to` value
- `animation: 'dynamic' | 'spring' = 'dynamic'` — passed to Blendy on init

**Outputs**:
- `closed: EventEmitter<void>` — fired after untoggle animation completes

**Lifecycle**:
1. `ngOnChanges` watches `open()` — when true, call `blendyService.toggle(blendyId)`
2. User action triggers `close()` → `blendyService.untoggle(blendyId, () => this.closed.emit())`
3. Escape key handled via `@HostListener('document:keydown.escape')` → same close flow

### Decision 3: Component tree changes

**CategoriesComponent**:
- Wrap the `.modal` div (lines 105-165) in `<ft-blendy-modal>`
- Add `data-blendy-from="category-trigger"` to the "New category" button (line 8)
- For edit: each card's edit button gets `data-blendy-from="cat-edit-{id}"`; the modal uses a single `category-modal` ID — Blendy uses the last triggered element as origin

**TransactionsPage**:
- Replace `<a routerLink="/transactions/new">` (lines 31, 52) with a `(click)` that sets a `showTransactionModal = signal(true)` on the page
- Add `<ft-blendy-modal [open]="showTransactionModal()" blendyId="transaction-modal">` with `<ft-transaction-form>` inside
- Route `/transactions/new` becomes fallback only (kept for deep-links)

**NotificationsDropdownComponent**:
- Replace `@if (isOpen())` panel with `<ft-blendy-modal [open]="isOpen()" blendyId="notifications-modal">`
- Trigger button (bell) gets `data-blendy-from="notifications-trigger"`

### Decision 4: Routing — preserve `/transactions/new` as fallback

**Choice**: Keep the route but mark it as secondary. Modal opens by default from list; direct navigation falls back to the page form.

**Rationale**: Deep-links from emails or bookmarks must still work. The modal doesn't replace the route — it supplements it.

### Decision 5: Blendy instance configuration — 'dynamic' for modals, 'spring' for notifications

**Choice**:
- Category and Transaction modals: `animation: 'dynamic'` — smoother for forms
- Notifications: `animation: 'spring'` — snappier, dropdown-like feel

**Rationale**: Dynamic provides easing curves suited for modal dialogs; spring fits the quick open/close rhythm of notifications.

## Data Flow

```
Button Click
    │
    ▼
set signal(true)
    │
    ▼
@if (open()) renders .blendy-target with [data-blendy-to]
    │
    ▼
afterNextRender → BlendyService.toggle('category-modal')
    │
    ▼
Blendy reads trigger bounding rect + target innerHTML → animates
```

```
close() called
    │
    ▼
blendyService.untoggle('category-modal', () => closed.emit())
    │
    ▼
Blendy plays collapse animation
    │
    ▼
callback fires → set signal(false)
    │
    ▼
@if (open()) becomes false → DOM removes .blendy-target
```

## DOM Manipulation Strategy

Blendy accesses elements via `document.querySelector('[data-blendy-to]')`. Since Angular uses emulated view encapsulation, the `data-blendy-to` attribute must be on the actual rendered DOM element — `[attr.data-blendy-to]` on the host binding works correctly.

**Important**: Do NOT use `viewEncapsulation: ViewEncapsulation.None` — that would leak styles. Instead, use `[attr.data-blendy-to]` which emits the attribute to the real DOM, and configure Blendy to query in the component's host area via `@ViewChild` reference if needed.

**Change detection timing**: Before calling `blendyService.toggle()`, call `cd.detectChanges()` to ensure the DOM has updated from the signal change. Delay of `0` (macrotask) is sufficient:

```typescript
ngOnChanges(changes: SimpleChanges) {
  if (changes['open'] && this.open()) {
    // Ensure DOM has updated
    setTimeout(() => {
      this.blendyService.toggle(this.blendyId);
    }, 0);
  }
}
```

## Animation Timing

- **DOM insertion → toggle()**: `0ms` (setTimeout 0) after signal turns true
- **untoggle callback → signal update**: After Blendy's animation completes (Blendy calls callback)
- **prefers-reduced-motion bypass**: When `prefersReducedMotion()` is true, `toggle()` and `untoggle()` are no-ops; CSS `.blendy-target { display: flex } / .blendy-target.hidden { display: none }` with transition handles show/hide directly

## Focus Trap

Deferred to v2 of this feature. v1:
- Modal receives focus on open via `autofocus` on first focusable element
- Escape key closes
- Backdrop click closes

## prefers-reduced-motion

Lives in `BlendyService`:
```typescript
readonly prefersReducedMotion = signal(false);

constructor() {
  afterNextRender(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion.set(mq.matches);
    mq.addEventListener('change', (e) => this.prefersReducedMotion.set(e.matches));
  });
}
```

When true, `toggle()` and `untoggle()` become no-ops; CSS handles instant show/hide via a `.reduced-motion` class applied to the modal wrapper.

## File Structure

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `blendy` dependency |
| `src/app/shared/services/blendy.service.ts` | Create | Singleton service, prefers-reduced-motion check, toggle/untoggle/update |
| `src/app/shared/components/blendy-modal/blendy-modal.component.ts` | Create | Wrapper component with signal inputs, lifecycle, close handling |
| `src/app/shared/components/blendy-modal/blendy-modal.component.html` | Create | Template with single .blendy-target wrapper |
| `src/app/shared/components/blendy-modal/blendy-modal.component.scss` | Create | Backdrop and modal styles |
| `src/app/features/categories/categories.component.html` | Modify | Add `data-blendy-from` to trigger buttons; wrap form in `<ft-blendy-modal>` |
| `src/app/features/categories/categories.component.ts` | Modify | Change `showForm` signal to drive `<ft-blendy-modal [open]>` |
| `src/app/features/transactions/pages/transactions.page.html` | Modify | Replace routerLinks with click handlers + add `<ft-blendy-modal>` |
| `src/app/features/transactions/pages/transactions.page.ts` | Modify | Add `showTransactionModal` signal, handle form closed |
| `src/app/features/transactions/transaction-form.component.ts` | Modify | Remove route-dependent navigation on success; emit to parent |
| `src/app/shared/layout/notifications-dropdown/notifications-dropdown.component.html` | Modify | Replace `@if` block with `<ft-blendy-modal>` |
| `src/app/shared/layout/notifications-dropdown/notifications-dropdown.component.ts` | Modify | `isOpen` signal drives modal directly |
| `app.routes.ts` | Modify | No change to transaction routes (fallback preserved) |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | BlendyService toggle/untoggle calls | Mock Blendy instance, verify calls with/sp without prefers-reduced-motion |
| Unit | FtBlendyModalComponent signal→toggle flow | Mock BlendyService, verify toggle called when open() becomes true |
| Unit | Close callback fires after untoggle | Mock BlendyService untoggle to call cb immediately, verify closed emits |
| Integration | Category modal opens/closes | Render with open=true, check .blendy-target exists; close, verify removed |
| Integration | prefers-reduced-motion skips Blendy | Set media query, open modal, verify Blendy.toggle not called |
| E2E | Full open→close flow for each modal | Playwright test: click trigger, verify animation plays, click backdrop, verify closes |

## Open Questions

- [ ] Should the transaction form modal be the same component for both create and edit, or separate create/edit modals?
- [ ] What happens if user opens category modal while transaction modal is already open — do we stack or block?
- [ ] Should the Bell icon `data-blendy-from` be static or dynamic per notification count?