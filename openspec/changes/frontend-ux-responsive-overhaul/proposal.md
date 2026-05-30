# Proposal: Frontend UX & Responsive Overhaul

## Intent

The Finance Tracker frontend has 12 critical UX problems: broken Telegram linking (hardcoded URLs, invisible auto-send button), zero mobile responsiveness (overflow, cut text, off-screen elements), settings/profile pages with no visual hierarchy, untranslated strings leaking technical keys to users, and a design system that drifts from the intended purple/lila palette. This change delivers a complete responsive, accessible, and visually consistent frontend.

## Scope

### In Scope
- **Telegram linking fix**: Replace hardcoded `your_bot_username` with `environment.telegramBotUrl`, define missing `.btn-telegram-auto` SCSS, add already-linked state with blocked button, prevent duplicate linkings (frontend guard + backend validation), loading/success/error/already-linked states
- **Responsive design system**: Mobile-first breakpoints (320px, 375px, 390px, 430px, 768px, 1024px+), fix ALL overflow/cut/off-screen issues across header, sidebar, dashboard, cards, transactions, settings, modals, notifications, profile, graphs
- **Settings page redesign**: Separate cards per section (Profile, Security, Notifications, Preferences, Linked Accounts), clear visual hierarchy, premium spacing
- **Profile page redesign**: Fix giant avatar, responsive sizing, proper alignment, separate cards, modern typography, consistent inputs
- **Notifications responsive fix**: Centered dropdown, adaptive width, smooth animations, no overflow
- **i18n audit**: Add missing `profile.insights`, `profile.accountAge`, `profile.totalTransactions` keys to all locales, fix fr.json missing `analytics` section, replace ~20 hardcoded English strings in profile page, replace 4 hardcoded strings in profile dropdown ("Profile", "Settings", "Signing out...", "Sign out")
- **Design system enforcement**: Enforce purple/lila palette (#8B5CF6 primary, #2DD4BF teal, #A855F7 medium purple, #EBD5F2 soft lilac, #F3E8FF pale lilac, #FAF8FD background, #FFFFFF cards, #2E1065 title, #4B5563 secondary, #5C009C pill text)
- **Notifications component**: Implement real notification data (currently empty shell)

### Out of Scope
- Backend API changes (except Telegram link-status endpoint for duplicate prevention)
- New features or business logic
- E2E testing infrastructure
- SSR or performance optimization beyond responsive fixes
- Dark mode redesign (keep existing dark/light, fix responsiveness in both)

## Capabilities

### New Capabilities
- `responsive-design`: Mobile-first responsive system across all components with defined breakpoints, overflow prevention, and touch-friendly targets
- `notifications`: Real notification data model, service, and dropdown with read/dismiss states

### Modified Capabilities
- `auth`: Telegram linking flow gains already-linked state, duplicate prevention, proper deep linking with environment variable
- `i18n`: All locale files synchronized (es/en/fr), missing keys added, no technical keys visible to users
- `navigation`: Profile dropdown hardcoded strings replaced with translate pipe, responsive avatar sizing
- `user-insights`: Profile page uses translated keys, proper visual hierarchy with card-based layout
- `dashboard`: Stat cards, transactions table, and graphs responsive at all breakpoints
- `analytics`: Charts responsive, no overflow on mobile viewports
- `landing`: Mobile navbar, CTA buttons, and language dropdown work at 320px+

## Approach

1. **Design tokens first**: Update `design-tokens.ts`, `tailwind.config.ts`, and `styles.scss` to enforce the purple/lila palette with proper CSS variables
2. **Responsive base layer**: Create shared responsive utilities (container queries, safe padding, touch targets ≥44px)
3. **Component-by-component refactor**: Settings → Profile → Notifications → Dashboard → Transactions → Analytics → Landing → Profile dropdown
4. **i18n sweep**: Audit all components for hardcoded strings, add missing keys, synchronize fr.json
5. **Telegram fix**: Replace hardcoded URLs, define missing SCSS, add already-linked state
6. **Notifications**: Implement real data model and service

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/shared/ui/design-tokens.ts` | Modified | Update color palette to purple/lila spec |
| `src/tailwind.config.ts` | Modified | Add responsive breakpoint utilities |
| `src/styles.scss` | Modified | CSS variables, mobile-first base styles |
| `src/app/features/settings/*` | Modified | Telegram link fix, card-based redesign |
| `src/app/features/profile/*` | Modified | Avatar fix, card layout, i18n sweep |
| `src/app/shared/layout/profile-dropdown/*` | Modified | Replace hardcoded strings, responsive avatar |
| `src/app/shared/layout/notifications-dropdown/*` | Modified | Implement real data, responsive centering |
| `src/app/features/dashboard/*` | Modified | Responsive cards, graphs, transactions |
| `src/app/features/transactions/*` | Modified | Responsive table, filters, form |
| `src/app/features/analytics/*` | Modified | Responsive charts, no overflow |
| `src/app/features/landing/*` | Modified | Mobile navbar, CTA, language dropdown |
| `src/assets/i18n/fr.json` | Modified | Add missing analytics section, profile keys |
| `src/assets/i18n/en.json` | Modified | Add missing profile keys |
| `src/assets/i18n/es.json` | Modified | Add missing profile keys |
| `src/environments/*.ts` | Unchanged | Already has correct `telegramBotUrl` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CSS regression across pages | High | Component-scoped SCSS, visual regression checklist per page |
| i18n keys mismatch at runtime | Medium | Compile-time check: grep all `| translate` pipes against locale files |
| Telegram deep linking fails on iOS | Medium | Test `tg://resolve?domain=hormigaTrackerBot` fallback for mobile |
| Profile page refactor breaks form validation | Low | Keep FormGroup logic unchanged, only restructure HTML/SCSS |
| Notifications service needs backend endpoint | Medium | Use mock data initially, integrate with real endpoint when available |

## Rollback Plan

1. Revert git commit (all changes are frontend-only)
2. If responsive changes break desktop: restore original SCSS files per component
3. If i18n changes cause missing keys: restore original locale files from git
4. If Telegram linking breaks: restore hardcoded URL as temporary fix, create follow-up issue
5. Design token changes are isolated — revert `design-tokens.ts` + `tailwind.config.ts` + `styles.scss` together

## Dependencies

- Backend `/api/auth/link-status` endpoint must return `linked: true` for already-linked accounts (verify with backend team)
- No new npm packages required

## Success Criteria

- [ ] `ng build --configuration production` succeeds with zero warnings
- [ ] `ng test --no-watch --browsers=ChromeHeadless` passes
- [ ] All pages render correctly at 320px, 375px, 390px, 430px, 768px, 1024px, 1440px
- [ ] Zero hardcoded English strings in profile page, profile dropdown, or settings
- [ ] fr.json has same key count as en.json (within 2% tolerance)
- [ ] Telegram link uses `environment.telegramBotUrl`, not hardcoded value
- [ ] `.btn-telegram-auto` has visible SCSS styles
- [ ] Already-linked account shows blocked button + "Account linked" state
- [ ] No horizontal overflow on any page at any breakpoint
- [ ] Profile avatar is responsive (max 48px mobile, 64px desktop)
- [ ] Notifications dropdown centered, no off-screen content
- [ ] Design palette matches spec: primary #8B5CF6, teal #2DD4BF, no green
