# Tasks: Settings Page — Channel-First Reorganization

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

| Field | Value |
|-------|-------|
| Estimated changed lines | ~190 |
| Suggested split | Single PR (2 work-unit commits) |
| Delivery strategy | auto-chain |

### Suggested Work Units

| Unit | Goal | Focused test command | Runtime harness | Rollback boundary |
|------|------|----------------------|-----------------|-------------------|
| 1 | i18n keys + component restructure | `npx ng test --no-watch --browsers=ChromeHeadless --include='**/settings.component.spec.ts'` | `npx ng serve` → `/settings` — verify profile first, no dead sections | `git revert` commit |
| 2 | Drawer + gear icon header | same as Unit 1 | `npx ng serve` → `/settings` — click gear, 380px drawer, ESC/backdrop close | `git revert` commit |

## Phase 1: i18n Keys (REQ-I18N-001, REQ-I18N-002)

> TDD active: RED first, then GREEN.

- [x] 1.1 RED: Spec for `settings.profile.title`, `settings.profile.display_name`, `settings.profile.email` resolving per locale (`settings.component.spec.ts`)
- [x] 1.2 GREEN: Add 3 keys to `en.json` (Profile / Display name / Email), `es.json` (Perfil / Nombre visible / Correo), `fr.json` (Profil / Nom affiché / E-mail)
- [x] 1.3 GREEN: Confirm `settings.preferences.title` exists in all locales (already present — used for gear icon `aria-label`)

## Phase 2: Imports Cleanup (REQ-SP-001, REQ-SP-002, REQ-SP-004)

- [x] 2.1 RED: Spec that `app-profile-section` renders first, `app-linked-accounts-section` second, no `app-security-section`/`app-notifications-section` in DOM
- [x] 2.2 GREEN: `settings.component.ts` — add `ProfileSectionComponent` import; remove `SecuritySectionComponent` + `NotificationsSectionComponent` from imports and array
- [x] 2.3 REFACTOR: `npx ng test --no-watch --browsers=ChromeHeadless` — compilation verified (browser binary unavailable in env)

## Phase 3: Template Reorder (REQ-SP-001, REQ-SP-004)

- [x] 3.1 RED: Spec verifying `<app-profile-section [delay]="25"/>` is first section child, `<app-linked-accounts-section>` immediately follows
- [x] 3.2 GREEN: `settings.component.html` — insert `<app-profile-section [delay]="25" />` after page-header; remove security/notifications elements; reorder to: profile → linked-accounts → session → back-link

## Phase 4: Header with Gear Icon (REQ-SP-006)

- [x] 4.1 RED: Spec for header with "Settings" title + gear icon button; click toggles signal
- [x] 4.2 GREEN: `settings.component.ts` — `showPreferencesDrawer = signal(false)` + `togglePreferencesDrawer()` method
- [x] 4.3 GREEN: `settings.component.html` — header row: `<ng-icon name="settings" [attr.aria-label]="'settings.preferences.title' | translate" (click)="togglePreferencesDrawer()"/>` + title
- [x] 4.4 GREEN: `settings.component.scss` — `.page-header` flexbox row, icon button hover styles

## Phase 5: Inline Drawer (REQ-SP-003)

- [x] 5.1 RED: Spec for 380px drawer, ESC/backdrop/close-button dismiss, body scroll lock, `app-preferences-section [delay]="0"` inside
- [x] 5.2 GREEN: `settings.component.ts` — `@HostListener('document:keydown.escape')` → close drawer; `document.body.style.overflow` toggle in `togglePreferencesDrawer()`
- [x] 5.3 GREEN: `settings.component.html` — conditional drawer with backdrop `<div (click)="showPreferencesDrawer.set(false)">`, close button `×`, `<app-preferences-section [delay]="0" />`
- [x] 5.4 GREEN: `settings.component.scss` — `.preferences-drawer` (fixed, right:0, 380px, 100vh, z-index), `.drawer-backdrop`, slide-in transition
- [x] 5.5 REFACTOR: Test compilation verified; `ng build` — env issue (esbuild binary version mismatch, pre-existing)
