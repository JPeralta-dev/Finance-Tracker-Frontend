# Proposal: Settings Page — Channel-First Reorganization

## Intent

Dead "coming soon" sections erode trust, missing profile identity violates product principles, and a generic SaaS structure doesn't express Flowr's channel-first differentiator. Reorganize Settings around channels as the primary content, surface user identity first, and hide global preferences behind a drawer.

## Scope

### In Scope
- Render `<app-profile-section>` as the first element — user identity confirmed before configuration
- Remove `<app-security-section>` and `<app-notifications-section>` from template + imports
- Move `<app-preferences-section>` into an inline drawer (signal toggle) behind a gear icon in the page header
- `<app-linked-accounts-section>` becomes the primary content below profile
- Logout and back link remain at bottom
- Add 3 translation keys: `settings.profile.title`, `settings.profile.display_name`, `settings.profile.email`

### Out of Scope
- Do NOT modify LinkedChannelCard or linked-accounts logic
- Do NOT create new design tokens or CSS custom properties
- Do NOT touch backend, services, or API layer
- Do NOT add functionality to Security or Notifications (they're being removed)
- WhatsApp/SMS "coming soon" cards — stay in linked-accounts section unchanged

## Capabilities

### New Capabilities
- `settings-page`: Settings page architecture contract — component order, drawer visibility, profile identity contract

### Modified Capabilities
- `i18n`: Add `settings.profile.title`, `settings.profile.display_name`, `settings.profile.email` across en.json, es.json, fr.json

## Approach

Inline drawer via `showPreferencesDrawer` signal in SettingsComponent — no new shared component. Gear icon (`heroCog6Tooth`, mapped as `settings` in ICONS) in page header toggles the signal. Preferences rendered conditionally with slide-in transition.

Template reorder: profile (first) → linked accounts → session/logout → back link. Imports: add `ProfileSectionComponent`, remove `SecuritySectionComponent` and `NotificationsSectionComponent`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/features/settings/settings.component.ts` | Modified | Add signal + ProfileSectionComponent import; remove Security/Notifications imports |
| `src/app/features/settings/settings.component.html` | Modified | Template reorder + drawer markup + gear icon |
| `src/assets/i18n/en.json` | Modified | Add `settings.profile.*` keys |
| `src/assets/i18n/es.json` | Modified | Add `settings.profile.*` keys |
| `src/assets/i18n/fr.json` | Modified | Add `settings.profile.*` keys |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing `settings.profile.*` keys crash TranslatePipe at runtime | High | Add keys as first task — existing profile namespace has displayName/email strings to model from |
| Drawer grows into over-engineered shared component | Low | Strict signal toggle only; no separate component file |

## Rollback Plan

Revert `settings.component.ts` and `settings.component.html` to prior versions. Translation keys are additive — no rollback needed. `git revert` the commit.

## Dependencies

- `ProfileSectionComponent` already exists as standalone (verified during exploration)
- `heroCog6Tooth` already in ICONS registry as `settings`
- No backend or service dependencies

## Success Criteria

- [ ] Profile section rendered as first element on Settings page
- [ ] No Security or Notifications "coming soon" sections visible
- [ ] Preferences accessible via gear icon drawer in page header
- [ ] Linked accounts section is the primary visual content below profile
- [ ] All 3 translation keys present in en.json, es.json, fr.json
- [ ] Existing settings spec tests pass without modification
