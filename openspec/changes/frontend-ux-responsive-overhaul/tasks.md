# Tasks: Frontend UX & Responsive Overhaul

**200-line rule**: Components (HTML+SCSS+TS) ≤200 lines total. Settings→6, Profile→4, dropdown→split. New ones comply.

## Workload Forecast

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Work Units (feature-branch-chain, `feat/ux-overhaul`)

- PR 1 (→tracker): Design tokens + responsive utils
- PR 2 (→PR 1): i18n sync + template sweep
- PR 3 (→PR 2): Notifications model/svc/dropdown
- PR 4 (→PR 3): Settings→6 subs + Telegram fix
- PR 5 (→PR 4): Profile→4 subs + dropdown split
- PR 6 (→PR 5): Dashboard/Landing/Analytics rwd

## Phase 1: Foundation (PR 1)

- [x] 1.1 Create `_tokens.scss` — purple/lila design tokens
- [x] 1.2 Create `_responsive.scss` — breakpoint mixins, safe-padding
- [x] 1.3 Import partials in `styles.scss`; fix `.theme-light` palette
- [x] 1.4 Add screens `tailwind.config.ts` (xs:375, md:768, lg:1024); fix light colors
- [x] 1.5 Fix `lightTokens` in `design-tokens.ts`
- [x] 1.6 TEST: CSS vars match spec; verify three-way token sync

## Phase 2: i18n (PR 2)

- [x] 2.1 Add analytics section to `fr.json`; add profile keys to all locales
- [x] 2.2 Replace 4 hardcoded strings in `profile-dropdown` HTML with translate pipe
- [x] 2.3 Replace ~20 hardcoded strings in `profile.page.html` with translate pipe
- [x] 2.4 TEST: fr.json key count within 2% of en; no raw keys visible

## Phase 3: Notifications (PR 3)

- [x] 3.1 Create `Notification` interface + `NotificationType` in `notification.model.ts`
- [x] 3.2 Implement `NotificationService` — signal state, CRUD, mock data
- [x] 3.3 Rewrite dropdown (≤200) — service inject, list, empty, badge
- [x] 3.4 TEST: service signals; dropdown renders; click=read; dismiss

## Phase 4: Settings + Telegram (PR 4)

- [x] 4.1 Refactor `settings.component.ts` → container, host 5 sections
- [x] 4.2 Create `profile-section` — display name + email
- [x] 4.3 Create `security-section` — password/2FA
- [x] 4.4 Create `notifications-section` — notification prefs
- [x] 4.5 Create `preferences-section` — theme/locale/currency
- [x] 4.6 Create `linked-accounts-section` — Telegram linking (env URL, iOS, guard)
- [x] 4.7 Add `.btn-telegram-auto` SCSS (linked-accounts-section)
- [x] 4.8 TEST: Telegram state machine; each section ≤200 lines

## Phase 5: Profile + Dropdown (PR 5)

- [x] 5.1 Refactor `profile.page` → container, host 3-4 sections
- [x] 5.2 Create `profile-avatar-card` — avatar + display name
- [x] 5.3 Create `profile-personal-info` — name/email form
- [x] 5.4 Create `profile-insights-card` — account age + tx count
- [x] 5.5 Split `profile-dropdown` → trigger + menu (each ≤200)
- [x] 5.6 TEST: cards render; responsive avatar; each ≤200 lines

## Phase 6: Dashboard/Landing/Analytics RWD (PR 6)

- [ ] 6.1 Refactor `stat-card` (279→≤200) — extract shared style
- [ ] 6.2 Update `stats-grid` — mobile-first grid
- [ ] 6.3 Scrollable transactions wrapper <768px
- [ ] 6.4 Responsive charts (100% width, no fixed height)
- [ ] 6.5 Landing hamburger <768px; CTA 44x44; icon replaces "Sign In"
- [ ] 6.6 Language dropdown fits 320px; stack analytics <768
- [ ] 6.7 TEST: no overflow 320px; hamburger toggles; grid columns
