# Proposal: Frontend Bug Fixes

## Intent

Four frontend bugs: dead i18n files, logout double-redirect race, mobile sticky header glitch, and theme flash. Self-contained fixes, no new dependencies.

## Scope

### In Scope
- Delete 3 dead JSON files in `src/app/core/i18n/`
- Remove `router.navigate` from `clearTokens()`; add redirect to interceptor refresh-failure + logout subscriber
- Add GPU compositing to `.topbar` for Chrome Android sticky fix
- Add inline `<script>` in `index.html` for pre-bootstrap theme application

### Out of Scope
- Backend changes, new dependencies, i18n enhancements, full mobile redesign, SSR

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `auth`: Redirect moves from `clearTokens()` to caller sites (interceptor, logout subscriber). Guard handles direct route access
- `i18n`: Remove dead files; initializer stays functional (loads from `/assets/i18n/`)
- `navigation`: Topbar CSS receives GPU compositing fix
- `landing`: Theme pre-application prevents FOUC

## Approach

| Bug | Fix | Files |
|-----|-----|-------|
| Duplicate i18n | Delete `core/i18n/{en,es,fr}.json`. Keep initializer (loads from `/assets/i18n/`) | `core/i18n/*.json` |
| Logout race | Remove `router.navigate` from `clearTokens()`. Add redirect to interceptor refresh-failure + logout subscriber | `auth.service.ts`, `auth.interceptor.ts` |
| Sticky scroll | Add `will-change: transform` to `.topbar` | `topbar.component.scss` |
| Theme flash | Inline script applies theme from localStorage before bootstrap. Remove `class="dark"` | `index.html` |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/core/i18n/` | Removed | Delete 3 dead JSON files |
| `src/app/core/services/auth.service.ts` | Modified | Remove navigation from `clearTokens()` |
| `src/app/core/interceptors/auth.interceptor.ts` | Modified | Add `Router` injection + navigate on refresh failure |
| `src/app/shared/layout/topbar/topbar.component.scss` | Modified | Add `will-change: transform` |
| `src/index.html` | Modified | Remove `class="dark"`, add inline theme script |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Logout hangs if guard doesn't fire | Low | Guard fires on every protected route; interceptor also handles 401 |
| Inline script conflicts with ThemeService | Low | Script runs before Angular; effect handles subsequent changes |
| `will-change` memory overhead | Low | Single element, negligible. Fallback: `transform: translateZ(0)` |

## Rollback Plan

1. Revert git commit (4-5 files changed)
2. If logout breaks: restore `router.navigate` in `clearTokens()` as hotfix
3. If theme script causes issues: remove `<script>`, restore `class="dark"`
4. Dead i18n files recoverable from git history

## Dependencies

- None. Frontend-only, no new packages.

## Success Criteria

- [ ] `ng build --configuration production` succeeds
- [ ] `ng test --no-watch --browsers=ChromeHeadless` passes
- [ ] No `core/i18n/*.json` files exist
- [ ] Logout navigates to `/login` exactly once
- [ ] Topbar scrolls smoothly on Chrome Android
- [ ] No theme flash on page load
