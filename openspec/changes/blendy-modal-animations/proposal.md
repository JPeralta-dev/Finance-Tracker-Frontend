# Proposal: Blendy Modal Animations

## Intent

Replace instant show/hide and page-navigation patterns with smooth element-to-element transitions using Blendy (~5-8KB). The app currently has zero modal animations — the category form appears/disappears instantly, the transaction form is a full page route, and notifications is a dropdown. Blendy provides a unique "morph from trigger button" effect that CSS-only or `@angular/animations` cannot replicate without significant custom code.

## Scope

### In Scope
- **BlendyService**: Singleton service that creates/manages the Blendy instance, exposes `toggle()`, `untoggle()`, `update()`, and respects `prefers-reduced-motion`
- **FtBlendyModalComponent**: Reusable standalone wrapper component that encapsulates Blendy lifecycle (toggle on open, untoggle + callback on close, single-wrapper enforcement)
- **Category modal**: Replace `@if (showForm())` block with `<ft-blendy-modal>`, wire trigger button with `data-blendy-from`, modal with `data-blendy-to`
- **Transaction form**: Convert from page route (`/transactions/new`) to modal launched from the transactions list; preserve all form logic (ReactiveForms, edit mode, validation)
- **Notifications**: Convert from dropdown panel to modal with Blendy animation, triggered from the bell icon in the header

### Out of Scope
- Command palette animation (already has working CSS animations)
- Profile dropdown animation (different UI pattern, low value)
- Router guard changes for transaction form (route will remain as fallback)
- Backend changes

## Capabilities

### New Capabilities
- `blendy-integration`: BlendyService singleton, FtBlendyModalComponent wrapper, `prefers-reduced-motion` support, npm dependency
- `transaction-modal`: Transaction form as modal (page → modal conversion), trigger integration in transactions list, route fallback preserved
- `notifications-modal`: Notifications as modal instead of dropdown, bell trigger integration

### Modified Capabilities
- None (no existing spec-level capabilities change — these are all new behavioral patterns)

## Approach

### Architecture: Wrapper + Service Pattern

```
BlendyService (providedIn: 'root')
  └── createBlendy({ animation: 'dynamic' })
  └── toggle(id), untoggle(id, cb), update()
  └── prefersReducedMotion(): boolean

FtBlendyModalComponent (standalone)
  ├── Inputs: open (signal), blendyId (string), animation ('dynamic'|'spring')
  ├── Outputs: close (EventEmitter)
  ├── Handles: toggle on open=true, untoggle+callback on open=false
  ├── Enforces: single-wrapper constraint internally
  └── Projects: content via ng-content
```

### Per-Component Integration

| Component | Trigger Element | Blendy ID | Migration |
|-----------|----------------|-----------|-----------|
| Categories | "New category" button | `category-modal` | Replace `@if` block, add `data-blendy-from` to button |
| Transactions | "New transaction" button in list | `transaction-modal` | Extract form content from page, wrap in modal, keep route as fallback |
| Notifications | Bell icon in header | `notifications-modal` | Replace dropdown panel, add `data-blendy-from` to bell |

### Accessibility
- `prefers-reduced-motion`: BlendyService checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and skips animation, showing/hiding instantly
- Focus trap: wrapper component manages focus (move to modal on open, return to trigger on close)
- Escape key: closes modal via `untoggle` callback
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on wrapper

### Angular 17 Compatibility
- Uses `afterNextRender` for Blendy initialization (avoids SSR issues, though app is SPA)
- Signal-based `open` input with `linkedSignal` for internal state
- `untoggle` callback fires BEFORE signal update to avoid race conditions

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add `blendy` dependency |
| `shared/services/blendy.service.ts` | New | Singleton Blendy instance manager |
| `shared/components/blendy-modal/blendy-modal.component.ts` | New | Reusable wrapper component |
| `shared/components/blendy-modal/blendy-modal.component.html` | New | Template with single-wrapper, backdrop, dialog |
| `shared/components/blendy-modal/blendy-modal.component.scss` | New | Modal styles (backdrop, dialog, transitions) |
| `features/categories/categories.component.{html,ts}` | Modified | Replace modal block with `<ft-blendy-modal>`, add blendy-from to trigger |
| `features/transactions/` | Modified | Extract form into modal, add trigger in list component, preserve route |
| `shared/layout/notifications-dropdown/notifications-dropdown.component.{html,ts}` | Modified | Convert dropdown to modal pattern |
| `app.routes.ts` | Modified | Transaction form route becomes optional fallback |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Blendy v0.0.1 instability | Medium | Pin exact version, keep CSS fallback styles, test thoroughly |
| Single-wrapper constraint conflicts with Angular `@if` | Medium | Wrapper component manages DOM; Blendy `update()` called after structural changes |
| `untoggle` callback timing with Angular signals | Medium | Signal updates ONLY inside callback, never before animation completes |
| Transaction form as modal loses deep-linking | Low | Keep route as fallback; modal opens from list, route still works for direct links |
| Bundle size increase | Low | ~5-8KB minified, negligible for the UX improvement |
| `prefers-reduced-motion` not respected by Blendy | Medium | Wrapper checks media query and bypasses Blendy, uses instant show/hide |

## Rollback Plan

1. **Uninstall Blendy**: `npm uninstall blendy`
2. **Revert component changes**: Git revert the modified component files
3. **Restore transaction route**: Ensure `/transactions/new` route is fully functional (it remains as fallback during migration)
4. **Remove new files**: Delete `blendy.service.ts` and `blendy-modal/` component directory
5. **Fallback behavior**: All three UI patterns (category modal, transaction page, notifications dropdown) work exactly as before — no runtime dependency on Blendy

The rollback is safe because: (a) the transaction route is preserved as fallback, (b) Blendy is purely additive (no existing behavior is destroyed, only wrapped), and (c) all new files are isolated in `shared/`.

## Dependencies

- `blendy` npm package (v0.0.1 or latest stable)
- Angular 17.3+ (already satisfied)
- No backend changes required

## Success Criteria

- [ ] Category modal opens with smooth morph animation from "New category" button
- [ ] Transaction form opens as modal from transactions list (page route still works as fallback)
- [ ] Notifications panel opens as modal from bell icon
- [ ] `prefers-reduced-motion: reduce` disables all Blendy animations (instant show/hide)
- [ ] Escape key closes all three modals with collapse animation
- [ ] Focus returns to trigger element after modal closes
- [ ] No console errors, no layout shifts during animation
- [ ] `ng build --configuration production` succeeds
- [ ] Bundle size increase < 10KB
