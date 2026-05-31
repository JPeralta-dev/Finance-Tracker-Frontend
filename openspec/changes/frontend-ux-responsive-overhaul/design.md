# Design: Frontend UX & Responsive Overhaul

## Architecture

### Decision: Shared Utilities vs Per-Component SCSS

**Choice**: Create `src/styles/_responsive.scss` and `src/styles/_tokens.scss` as shared partials; component SCSS imports them.

**Alternatives considered**: Inline all responsive styles per-component; use Tailwind-only approach.
**Rationale**: The proposal explicitly calls for "shared responsive utilities (container queries, safe padding, touch targets ≥44px)". Tailwind handles layout utilities; SCSS mixins handle component-specific media queries. Mixing both is the existing pattern (see `profile-dropdown.component.scss` lines 56-59, 85-88). Shared partials prevent breakpoint token drift across 12+ components.

**Files created**:
- `src/styles/_responsive.scss` — breakpoint mixins, safe-padding, touch-targets
- `src/styles/_tokens.scss` — CSS variable overrides for light theme purple/lila palette

**Files modified**:
- `src/styles.scss` — add `@import` for new partials

---

### Decision: Light Theme Color Alignment

**Choice**: Align `tailwind.config.ts` light theme section and `styles.scss .theme-light` with the proposal palette (#8B5CF6 primary, #2DD4BF teal, #A855F7 medium purple, etc.).

**Alternatives considered**: Leave dark theme as-is, only fix light theme.
**Rationale**: The proposal spec (primary #8B5CF6) describes the light theme palette. Current `tailwind.config.ts` light theme uses `#6366F1` (indigo) for info, not the specified purple. `design-tokens.ts` `lightTokens` already has `#8B5CF6` at `accent.end`, but `tailwind.config.ts` light theme doesn't expose it as a primary token. The fix is to update `tailwind.config.ts` light theme colors to match the proposal spec, ensuring CSS variables and Tailwind utilities are consistent.

---

## Component Changes

### Settings Component
**Files**: `src/app/features/settings/settings.component.ts`, `settings.component.html`, `settings.component.scss`

**TS changes**:
- Replace `window.open('https://t.me/your_bot_username', ...)` (lines 176, 181) with `environment.telegramBotUrl`
- Add `linked` state check in `generateCode()` to block duplicate linking attempts

```typescript
// Before (line 175-177)
openTelegram(): void {
  window.open('https://t.me/your_bot_username', '_blank');
}

// After
openTelegram(): void {
  window.open(environment.telegramBotUrl, '_blank');
}
```

**HTML changes**: Add disabled state for already-linked button, show "Account linked" text per auth spec.

**SCSS changes**: Define `.btn-telegram-auto` (currently referenced but unstyled). Currently `settings.component.scss` only has `.btn-telegram` (line 337). Add `.btn-telegram-auto` with distinct visual weight (filled purple gradient vs ghost button for `.btn-telegram`).

---

### Profile Dropdown Component
**Files**: `src/app/shared/layout/profile-dropdown/profile-dropdown.component.html`, `profile-dropdown.component.scss`

**HTML changes** (lines 48, 57, 70, 73):
```html
<!-- Before -->
<span>Profile</span>
<span>Settings</span>
<span>Signing out...</span>
<span>Sign out</span>

<!-- After -->
<span>{{ 'nav.profile' | translate }}</span>
<span>{{ 'nav.settings' | translate }}</span>
<span>{{ 'profile.signingOut' | translate }}</span>
<span>{{ 'profile.signOut' | translate }}</span>
```

**SCSS changes**: Avatar sizing — `.profile-dropdown__avatar` at line 32 is 32px. Add responsive override: 48px max on mobile (<768px) via media query.

---

### Profile Page
**Files**: `src/app/features/profile/profile.page.html`, `profile.page.scss`

**HTML changes**: Hardcoded strings "Loading profile...", "Error loading profile", "Retry", "Display Name", "Email Address", "Display name is required", "Email cannot be changed", "Save Changes" → use `| translate` pipe.

**SCSS changes**:
- Replace non-existent `--surface-0`, `--surface-1` CSS vars with proper design tokens (`--bg-secondary`, `--bg-tertiary`)
- Avatar: `.profile-avatar` max 48px mobile, 64px desktop
- Add card-based layout: wrap each section (form, insights, stats) in `.profile-card` with consistent padding, border-radius, background

```scss
// Before (.profile-form)
background: var(--surface-1); // undefined

// After
background: var(--bg-secondary);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
```

---

### Notifications Dropdown
**Files**: `src/app/shared/layout/notifications-dropdown/notifications-dropdown.component.{ts,html,scss}`

**TS changes**: Replace empty shell with real `NotificationService` (see Notifications Data Model section).

**HTML changes**: Add `*ngFor` over notifications list, mark-as-read on click, dismiss button, empty state.

**SCSS changes**: Dropdown centering — `.notifications-dropdown__panel` (line 28-41) uses `right: 0`. On mobile (<768px), change to `left: 50%; transform: translateX(-50%)` so it centers instead of being right-aligned and potentially off-screen.

---

### Dashboard — Stats Grid
**Files**: `src/app/features/dashboard/components/stats-grid/stats-grid.component.scss`

**SCSS changes**: Current breakpoints (640px, 1025px) don't match proposal (320/375/390/430/768/1024+). Update:
```scss
// Before (lines 11-22)
@media (max-width: 640px) { grid-template-columns: 1fr; }
@media (min-width: 641px) and (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
@media (min-width: 1025px) { grid-template-columns: repeat(4, 1fr); }

// After (mobile-first per responsive-design spec)
grid-template-columns: 1fr; // default (320-374px single column)
@media (min-width: 375px) { grid-template-columns: repeat(2, 1fr); } // 375px+
@media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); } // tablet (keep 2)
@media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); } // desktop
```

---

## Design Tokens

### Light Theme Palette (per proposal spec)
Update `tailwind.config.ts` light theme section and `styles.scss .theme-light`:

| Token | Current (wrong) | Proposal Spec |
|-------|-----------------|---------------|
| Primary | `#6366F1` (indigo) | `#8B5CF6` |
| Teal (success indicator) | `#059669` (emerald) | `#2DD4BF` |
| Medium purple | `#A78BFA` | `#A855F7` |
| Soft lilac | — | `#EBD5F2` |
| Pale lilac | — | `#F3E8FF` |
| Background | `#F4F6FB` | `#FAF8FD` |
| Cards | `#FFFFFF` (ok) | `#FFFFFF` |
| Title text | `#1E293B` (dark) | `#2E1065` |
| Secondary text | — | `#4B5563` |
| Pill text | — | `#5C009C` |

### Enforcement Strategy
Three files must stay in sync — any token change requires updating all three:
1. `src/styles.scss` (CSS custom properties)
2. `src/tailwind.config.ts` (theme.extend.colors)
3. `src/app/shared/ui/design-tokens.ts` (TypeScript interface)

The `design-tokens.ts` `lightTokens` already has `accent.end: '#8B5CF6'` — tailwind just needs to expose it correctly.

---

## i18n Strategy

### Missing Keys to Add

**fr.json** — add entire `analytics` section (currently missing, 22 keys) and profile keys:
```
profile.signingOut → "Déconnexion en cours..."
profile.signOut → "Se déconnecter"
profile.insights → "Insights"
profile.accountAge → "Ancienneté du compte"
profile.totalTransactions → "Total des transactions"
```

**en.json / es.json** — add missing profile keys:
```
profile.signingOut, profile.signOut, profile.insights, profile.accountAge, profile.totalTransactions
```

### Hardcoded String Replacement

**Profile dropdown** (`profile-dropdown.component.html`): 4 hardcoded strings → `| translate`
**Profile page** (`profile.page.html`): ~10 hardcoded English strings in error/loading states, form labels, button text → `| translate`

### Validation
After i18n sweep, run compile-time check:
```bash
grep -r "| translate" src/app/features/profile --include="*.html" | wc -l  # should match hardcoded count
```
Ensure `fr.json` key count is within 2% of `en.json`.

---

## Telegram Linking Flow

### State Machine

```
[idle] ──generateCode()──▶ [generating] ──success──▶ [polling]
                                                     │
                                           ┌─────────┴──────────┐
                                           ▼                   ▼
                                     [linked]           [error]
                                     (backend
                                     returns
                                     linked:true)
```

**States**:
- `idle`: No code generated, show "Generate code" button
- `generating`: API call in progress, button disabled + spinner
- `polling`: Code displayed, polling `/auth/link-status` every 3s
- `linked`: Telegram connected, show "Account linked" badge + disabled button
- `already-linked`: On load, if `linkStatus` returns `linked: true`, skip to linked state
- `error`: API failure, show error message, button re-enabled

### Deep Link URL Construction

```typescript
// settings.component.ts lines 175-182
openTelegram(): void {
  window.open(environment.telegramBotUrl, '_blank');
}

openTelegramWithCode(code: string): void {
  const message = encodeURIComponent(`/link ${code}`);
  window.open(`${environment.telegramBotUrl}?text=${message}`, '_blank');
}
```

**iOS Telegram deep link fallback**: `tg://resolve?domain=hormigaTrackerBot`. If `environment.telegramBotUrl` fails on mobile, the `tg://` scheme opens the Telegram app directly. Add UA detection:
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const url = isIOS 
  ? `tg://resolve?domain=hormigaTrackerBot&text=${message}`
  : `${environment.telegramBotUrl}?text=${message}`;
```

### Duplicate Linking Prevention

1. **Frontend guard**: In `generateCode()`, if `isLinked()` is true, return early without calling API.
2. **Backend validation**: Backend `/api/auth/link-status` returns `linked: true` for already-linked accounts (backend team dependency — verify before apply).

---

## Responsive Breakpoints

### Tailwind Config Breakpoints

```typescript
// tailwind.config.ts — add to theme.extend
screens: {
  'xs': '375px',
  'sm': '320px',    // proposal says 320px as base
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1440px',
},
```

Note: Tailwind's default `sm` is 640px. We override to `320px` but this affects all `sm:` classes globally. Verify no existing components rely on `sm:` at 640px before changing.

### Safe Padding System

```scss
// src/styles/_responsive.scss
$safe-padding-xs: 12px;  // 320-430px
$safe-padding-md: 16px;  // 768px
$safe-padding-lg: 24px;  // 1024px+

.page-container {
  padding-left: $safe-padding-xs;
  padding-right: $safe-padding-xs;
  
  @media (min-width: 768px) {
    padding-left: $safe-padding-md;
    padding-right: $safe-padding-md;
  }
  
  @media (min-width: 1024px) {
    padding-left: $safe-padding-lg;
    padding-right: $safe-padding-lg;
  }
}
```

### Touch Target Minimum

All interactive elements below 768px viewport:
```scss
// _responsive.scss
@mixin touch-target {
  min-height: 44px;
  min-width: 44px;
}

// Usage in component SCSS
.profile-dropdown__trigger,
.notifications-dropdown__trigger,
.btn {
  @media (max-width: 767px) {
    @include touch-target;
  }
}
```

---

## Notifications Data Model

### Interface

```typescript
// src/app/core/models/notification.model.ts
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  actionUrl: string | null;
}
```

### Service Pattern (Angular Signals)

```typescript
// src/app/core/services/notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter(n => !n.read).length);

  fetch(): Observable<Notification[]> { /* HTTP call or mock */ }
  markAsRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }
  dismiss(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }
  clearAll(): void {
    this._notifications.set([]);
  }
}
```

### Mock Data Strategy

Until backend endpoint is available, use mock data in service:
```typescript
private mockNotifications: Notification[] = [
  { id: '1', title: 'Welcome!', message: 'Your account is ready.', type: 'success', read: false, createdAt: new Date(), actionUrl: null },
  // ...
];
```

### Type Styling

```scss
// notifications-dropdown.component.scss
.notification-item {
  border-left: 3px solid transparent;
  
  &--info { border-left-color: var(--info); }
  &--success { border-left-color: #2DD4BF; } // teal per spec
  &--warning { border-left-color: var(--warning); }
  &--error { border-left-color: var(--danger); }
}
```

---

## Testing Approach

### Unit Tests
| Component | What to Test |
|-----------|-------------|
| `NotificationService` | Signal updates, computed unread count, markAsRead/dismiss/clearAll |
| `calculateAccountAge()` (profile.page.ts) | Edge cases: <1 month, 1-11 months, 12+ months |
| `Telegram linking state machine` | All state transitions |
| `SettingsComponent.generateCode()` | Blocks if already-linked |

### Integration Tests
| Component | What to Test |
|-----------|-------------|
| Profile dropdown | i18n pipe renders correct translation for each locale |
| Notifications dropdown | Renders notification list, click marks as read, dismiss removes |
| Stats grid | Renders correct column count at each breakpoint (JS tests with viewport resize) |

### E2E (Manual QA per proposal checklist)
- All pages at 320px, 375px, 390px, 430px, 768px, 1024px, 1440px
- No horizontal overflow on any page
- Telegram deep link opens on mobile
- i18n: no raw keys visible, fr.json synced

---

## Rollback Strategy

1. **Full revert**: `git revert {commit-hash}` — all changes are frontend-only, no backend dependency
2. **Per-file revert**:
   - Responsive regression: restore original SCSS per component
   - i18n regression: `git checkout HEAD -- src/assets/i18n/{en,es,fr}.json`
   - Telegram regression: restore hardcoded URL as temporary fix, create follow-up issue
   - Design token regression: revert `design-tokens.ts` + `tailwind.config.ts` + `styles.scss` together (they must stay in sync)
3. **Feature flag fallback**: No feature flags used — this is a straight refactor, no phased rollout needed

---

## Open Questions

- [ ] **Tailwind `sm:` breakpoint change**: Changing `sm` from 640px to 320px in `tailwind.config.ts` is a breaking change for any existing `sm:` utility usage. Need to audit all components for `sm:` usage before applying. Alternative: use custom breakpoint name like `xs-mobile:` instead of overriding `sm:`.
- [ ] **Backend `link-status` endpoint**: Confirm backend team has implemented `GET /api/auth/link-status` returning `{ linked: boolean, telegramId: string|null }`. Without it, the already-linked state cannot be implemented.
- [ ] **Notifications backend endpoint**: What endpoint returns notification data? Need to confirm URL before implementing `NotificationService.fetch()` with real HTTP.
- [ ] **`profile.totalTransactions` count**: Currently hardcoded to `0` in `userStats` (profile.page.ts line 79). Is there a backend endpoint to get transaction count, or should this field be removed from the spec?
- [ ] **i18n key `nav.profile` vs `profile.title`**: Profile dropdown "Profile" menu item — should it translate to `nav.profile` or `profile.title`? Current hardcoded is just "Profile" label. Recommend `nav.profile` since it's navigation, not the profile page title.