# Delta for Frontend Bug Fixes

## Domain: i18n-cleanup

Remove dead i18n JSON files from `src/app/core/i18n/`. Initializer loads from `/assets/i18n/` only.

### Requirements

#### Requirement: Remove Dead i18n Files

The system MUST delete `src/app/core/i18n/{en,es,fr}.json`. No source code SHALL import from `core/i18n/`.

##### Scenario: Files removed

- GIVEN three dead JSON files exist
- WHEN change applied
- THEN none exist

##### Scenario: No broken imports

- GIVEN files deleted
- WHEN `ng build` runs
- THEN no compilation errors

#### Requirement: Initializer Unaffected

Initializer SHALL load from `/assets/i18n/` only, MUST NOT reference `core/i18n/`.

##### Scenario: Loads from assets

- GIVEN app bootstraps
- THEN initializer fetches `/assets/i18n/{locale}.json`

---

## Domain: logout-redirect

Fix logout double-redirect race by moving `router.navigate` out of `clearTokens()` into caller sites.

### Requirements

#### Requirement: clearTokens() Must Not Navigate

`AuthService.clearTokens()` MUST NOT call `router.navigate`. SHALL only clear stored tokens.

##### Scenario: Clears state only

- GIVEN authenticated user
- WHEN `clearTokens()` called
- THEN tokens removed, no navigation

#### Requirement: Logout Subscriber Navigates

Profile-dropdown and mobile-menu MUST navigate to `/login` after `clearTokens()` succeeds.

##### Scenario: Profile dropdown logout

- GIVEN user on protected route
- WHEN clicks "Logout" in profile dropdown
- THEN `clearTokens()` runs, navigates to `/login` exactly once

##### Scenario: Mobile menu logout

- GIVEN user on protected route
- WHEN clicks "Logout" in mobile menu
- THEN `clearTokens()` runs, navigates to `/login`

#### Requirement: Interceptor Navigates on Refresh Failure

Auth interceptor MUST navigate to `/login` when token refresh fails (401, 403, network error).

##### Scenario: 401 on refresh

- GIVEN expired token
- WHEN refresh returns 401
- THEN tokens cleared, navigates to `/login`

#### Requirement: Auth Guard Unchanged

Auth guard MUST continue redirecting unauthenticated users to `/login` for protected routes.

##### Scenario: Unauthenticated blocked

- GIVEN no valid token
- WHEN navigating to `/dashboard`
- THEN guard redirects to `/login`

#### Requirement: No Re-navigation on Login

System MUST NOT navigate when logout occurs while user already on `/login`.

##### Scenario: Logout on login

- GIVEN user on `/login`
- WHEN logout triggers
- THEN tokens cleared, user stays

---

## Domain: mobile-sticky-header

Fix Chrome Android sticky header glitch via GPU compositing on `.topbar`.

### Requirements

#### Requirement: GPU Compositing on Topbar

`.topbar` MUST have `will-change: transform` or equivalent GPU compositing trigger.

##### Scenario: will-change applied

- GIVEN topbar SCSS inspected
- THEN `.topbar` has `will-change: transform` or equivalent

#### Requirement: No Repaint Jank

Glass transitions MUST NOT cause repaint jank during scroll on Chrome Android.

##### Scenario: Smooth scroll

- GIVEN user scrolls on Chrome Android
- WHEN topbar transitions glass/transparent
- THEN no visual stutter

#### Requirement: Address Bar Compatibility

Sticky header SHOULD work when Chrome Android address bar hides/shows.

##### Scenario: Address bar collapses

- GIVEN user scrolls down
- WHEN address bar hides
- THEN topbar stays sticky at correct position

---

## Domain: theme-flash

Prevent FOUC by applying theme before Angular bootstraps via inline script.

### Requirements

#### Requirement: No Hardcoded Dark Class

`index.html` MUST NOT have `class="dark"` on `<html>`.

##### Scenario: No dark class

- GIVEN `src/index.html` inspected
- THEN `<html>` has no `class="dark"`

#### Requirement: Inline Theme Script

`index.html` MUST have inline `<script>` in `<head>` reading `localStorage.flowr_theme` and applying theme class before Angular bootstraps.

##### Scenario: Saved theme applied

- GIVEN `localStorage.flowr_theme` = "light"
- WHEN script executes
- THEN `class="light"` applied before Angular renders

##### Scenario: Default dark

- GIVEN key not set
- WHEN script executes
- THEN `class="dark"` applied as default

##### Scenario: Graceful missing key

- GIVEN localStorage unavailable or key missing
- WHEN script executes
- THEN no error, `class="dark"` fallback

#### Requirement: ThemeService Unchanged

ThemeService effect for runtime changes MUST continue working. Inline script SHALL NOT interfere.

##### Scenario: Toggle after load

- GIVEN correct initial theme applied
- WHEN user clicks theme toggle
- THEN ThemeService updates `<html>` class immediately
