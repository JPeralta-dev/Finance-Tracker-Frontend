# Design: Frontend Bug Fixes

## Technical Approach

Four self-contained frontend bug fixes, each isolated to its own file(s). No new dependencies, no schema changes, no new capabilities. The design follows Angular 17 standalone conventions and the existing signal-based auth pattern.

---

## Architecture Decisions

### Decision: i18n File Cleanup Scope

**Choice**: Delete `src/app/core/i18n/{en.json, es.json, fr.json}` only. Keep `translation.initializer.ts`.
**Alternatives considered**: Delete all of `core/i18n/`, refactor initializer to use `core/i18n/` files.
**Rationale**: Initializer already loads from `/assets/i18n/` (line 16 of `translation.initializer.ts`). The only import of `core/i18n` is in `app.config.ts` for the initializer itself. Deleting the JSON files leaves the directory structurally intact for future use.

### Decision: Logout Navigation Ownership

**Choice**: `clearTokens()` is pure state; navigation lives in caller sites.
**Alternatives considered**: Keep `router.navigate` in `clearTokens()`, move navigation to auth guard.
**Rationale**: `clearTokens()` is called from three sites with different navigation contexts: `logout()` subscriber (may be on any page), interceptor refresh-failure (on any HTTP error), and error handler in profile-dropdown (on logout API failure). Centralizing navigation in `clearTokens()` creates the race condition — callers don't know whether navigation already happened. Pushing navigation to callers with route-awareness avoids double-navigate.

### Decision: Mobile Sticky Header Compositing

**Choice**: `will-change: transform` on `.topbar` with `transform: translateZ(0)` fallback.
**Alternatives considered**: `transform: translateZ(0)` alone, `contain: layout`.
**Rationale**: `will-change: transform` explicitly promotes the element to its own compositing layer, which is the standard fix for Android Chrome sticky header jank during `backdrop-filter` transitions. `translateZ(0)` is a fallback that forces GPU for the element without explicit compositing hint. Both together cover Chrome 89+ (will-change) and older engines (translateZ).

### Decision: Theme Pre-application Mechanism

**Choice**: Inline `<script>` in `<head>` before Angular bootstrap; removes `class="dark"` from `<html>`.
**Alternatives considered**: SSR meta tag, Angular APP_INITIALIZER for theme, CSS custom property injection.
**Rationale**: Eliminates FOUC (Flash of Unstyled Content) by applying the theme class before Angular renders. APP_INITIALIZER runs after Angular boots, which is too late — the dark flash would already occur. Inline script is the only mechanism that executes before Angular's bootstrap.

---

## Data Flow

### Bug 2 — Logout Redirect Flow

```
profile-dropdown.onLogout()          mobile-menu.onLogout()
        │                                  │
        └──────────┬───────────────────────┘
                   │ subscribe to authService.logout()
                   ▼
          AuthService.logout()
                   │ POST /api/auth/logout → backend
                   ▼
          clearTokens()  ← only clears localStorage + sets _userSignal to null
                   │
        ┌─────────┴──────────────┐
        ▼                        ▼
tap() in subscriber      auth interceptor (refresh fails)
        │                        │
        ▼                        ▼
router.navigate('/login')  Router.navigate('/login')
```

No double-navigate: interceptor only acts on 401 when refresh fails (i.e., after `clearTokens()` already ran). Subscribers only navigate if logout succeeds (or fails after calling clearTokens).

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/core/i18n/en.json` | Delete | Dead i18n file — not imported anywhere |
| `src/app/core/i18n/es.json` | Delete | Dead i18n file — not imported anywhere |
| `src/app/core/i18n/fr.json` | Delete | Dead i18n file — not imported anywhere |
| `src/app/core/services/auth.service.ts` | Modify | Remove `router.navigate` from `clearTokens()`; add `Router` import for type-only use in interceptor |
| `src/app/core/interceptors/auth.interceptor.ts` | Modify | Inject `Router`; on refresh-failure catch, call `clearTokens()` then `router.navigate(['/login'])` |
| `src/app/shared/layout/profile-dropdown/profile-dropdown.component.ts` | Modify | Pipe `logout()` observable with `tap` to call `router.navigate(['/login'])`, skip if already on `/login` |
| `src/app/shared/layout/mobile-menu/mobile-menu.component.ts` | Modify | Pipe `logout()` observable with `tap` to call `router.navigate(['/login'])` after `onClose()` |
| `src/app/shared/layout/topbar/topbar.component.scss` | Modify | Add `will-change: transform` and `transform: translateZ(0)` to `.topbar` |
| `src/index.html` | Modify | Remove `class="dark"` from `<html>`; add inline theme script before `</head>` |

---

## Detailed Fix Specifications

### Fix 1: i18n Cleanup

**Before** (directory structure):
```
src/app/core/i18n/
├── en.json       ← DELETE
├── es.json       ← DELETE
├── fr.json       ← DELETE
└── translation.initializer.ts  ← KEEP
```

**After**:
```
src/app/core/i18n/
└── translation.initializer.ts  ← KEEP
```

**Verification**: `grep -r "core/i18n" src/` shows only `app.config.ts` import of `translation.initializer.ts`. No imports reference the JSON files.

**Rollback**: `git checkout HEAD -- src/app/core/i18n/*.json`

---

### Fix 2: Logout Redirect

**Current** (`auth.service.ts` lines 122-126):
```typescript
clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  this.router.navigate(["/login"]);  // ← REMOVE THIS LINE
}
```

**Target** `clearTokens()`:
```typescript
clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Navigation moved to caller sites
}
```

**Interceptor** (`auth.interceptor.ts` lines 52-57 — current):
```typescript
catchError((refreshError) => {
  isRefreshing = false;
  refreshTokenSubject.next(null);
  authService.clearTokens();
  return throwError(() => refreshError);  // ← No navigation
});
```

**Target** interceptor after fix:
```typescript
catchError((refreshError) => {
  isRefreshing = false;
  refreshTokenSubject.next(null);
  authService.clearTokens();
  const router = inject(Router);
  router.navigate(['/login']);
  return throwError(() => refreshError);
});
```

**Profile dropdown** (`profile-dropdown.component.ts` lines 63-73 — current):
```typescript
this.authService.logout().subscribe({
  next: () => {
    this.isLoggingOut.set(false);
    // Navigation already handled by clearTokens()
  },
  error: () => {
    this.isLoggingOut.set(false);
    this.authService.clearTokens();
  },
});
```

**Target** profile-dropdown:
```typescript
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

private readonly currentUrl = toSignal(
  this.router.events.pipe(filter((e) => e instanceof NavigationEnd))
);

this.authService.logout().pipe(
  tap(() => {
    this.isLoggingOut.set(false);
  })
).subscribe({
  next: () => {
    if (this.currentUrl()?.urlAfterRedirects !== '/login') {
      this.router.navigate(['/login']);
    }
  },
  error: () => {
    this.isLoggingOut.set(false);
    this.authService.clearTokens();
    if (this.currentUrl()?.urlAfterRedirects !== '/login') {
      this.router.navigate(['/login']);
    }
  },
});
```

**Mobile menu** (`mobile-menu.component.ts` lines 34-36 — current):
```typescript
onLogout(): void {
  this.authService.logout().subscribe();
  this.onClose();
}
```

**Target** mobile-menu:
```typescript
onLogout(): void {
  this.authService.logout().pipe(
    tap(() => this.onClose())
  ).subscribe({
    next: () => this.router.navigate(['/login']),
    error: () => this.router.navigate(['/login']),
  });
}
```

**Edge Cases**:
- If user is already on `/login`, `router.navigate` is a no-op (Angular Router skips navigation to current URL).
- `clearTokens()` now runs without navigation, so auth guard catches any missed cases.

**Rollback**: Restore `this.router.navigate(['/login'])` in `clearTokens()` as a hotfix.

---

### Fix 3: Mobile Sticky Header

**Before** (`.topbar` class, lines 6-13):
```scss
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  transition:
    background var(--duration-normal) var(--ease-smooth),
    border-color var(--duration-normal) var(--ease-smooth),
    box-shadow var(--duration-normal) var(--ease-smooth);
```

**Target** `.topbar` class:
```scss
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  will-change: transform;
  transform: translateZ(0);
  transition:
    background var(--duration-normal) var(--ease-smooth),
    border-color var(--duration-normal) var(--ease-smooth),
    box-shadow var(--duration-normal) var(--ease-smooth);
```

**Testing approach**:
- Manual: Chrome Android device emulation, scroll up/down, observe topbar during glass transition with address bar hide/show.
- Visual check: no repaint flicker on scroll, header stays at correct position when address bar collapses.
- `backdrop-filter` and `will-change` are both supported in Chrome 89+ (Android 10+), which covers the target audience.

**Rollback**: Remove `will-change: transform;` and `transform: translateZ(0);` from `.topbar`.

---

### Fix 4: Theme Flash Prevention

**Before** (`src/index.html`):
```html
<html lang="en" class="dark">  <!-- ← REMOVE class="dark" -->
<head>
  <meta charset="utf-8">
  <title>Flowr — Personal Finance Tracker</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>  <!-- ← ADD SCRIPT BEFORE HERE -->
```

**Target** `src/index.html`:
```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Flowr — Personal Finance Tracker</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <script>
    (function() {
      try {
        var theme = localStorage.getItem('flowr_theme');
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
</head>
```

**ThemeService alignment** (`theme.service.ts`):
`ThemeService` currently sets `[data-theme]` on `<html>` and `.theme-light` on `<body>`. The inline script sets `dark` or `light` as class on `<html>`. This is a layered approach:
- Inline script: applies class before Angular bootstrap (prevents FOUC)
- ThemeService effect: manages `[data-theme]` attribute (existing behavior for CSS selectors)
- ThemeService also sets `.theme-light` on `<body>` (existing behavior for body-level styles)

**Proposed**: ThemeService should ALSO add/remove class on `<html>` to keep it in sync. Update the effect in `ThemeService`:

```typescript
effect(() => {
  const theme = this._currentTheme();
  document.documentElement.setAttribute('data-theme', theme);
  // Sync class on <html> for inline script consistency
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(theme);
  // body.class management stays as-is
  if (theme === 'light') {
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
  }
});
```

**Edge Cases**:
- `localStorage` unavailable: `catch(e)` applies `dark` as fallback.
- Key missing or invalid value: `else` branch applies `dark`.
- User already on light theme: script adds `light`, ThemeService effect syncs on bootstrap.

**Rollback**: Remove `<script>` block from `index.html`, restore `class="dark"` on `<html>`.

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `clearTokens()` no longer navigates | `auth.service.spec.ts` spy on Router.navigate |
| Unit | Profile-dropdown navigates on logout | `profile-dropdown.component.spec.ts` spy on Router.navigate |
| Unit | Interceptor navigates on refresh-failure | `auth.interceptor.spec.ts` spy on Router.navigate |
| Unit | Inline script sets correct class | Unit test not applicable; manual verification |
| Build | No compilation errors after JSON deletion | `ng build --configuration production` |
| Build | No broken imports from `core/i18n/` | `ng build` must succeed without errors |

---

## Migration / Rollout

No migration required. All four fixes are isolated file changes with no data transformation, feature flags, or phased rollout. The `ng build` production build is the gate for all four.

---

## Open Questions

- [ ] None. All four bugs have sufficient spec coverage and clear implementation paths.