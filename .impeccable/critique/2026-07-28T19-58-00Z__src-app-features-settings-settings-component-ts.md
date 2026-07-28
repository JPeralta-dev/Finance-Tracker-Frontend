---
target: Settings section
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-07-28T19-58-00Z
slug: src-app-features-settings-settings-component-ts
---
# `$impeccable critique` — Settings Page

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Tiny logout spinner, no global loading state, Profile section absent |
| 2 | Match Between System / Real World | 3 | Good conventions but "Linked Accounts" is misleading for messaging channels |
| 3 | User Control and Freedom | 2 | Logout error trap, no undo for preferences, Gmail disconnect has no confirmation |
| 4 | Consistency and Standards | 2 | `.section-icon` size mismatch between scopes, duplicate `.spinner-sm` definitions, hardcoded gradient outside token system |
| 5 | Error Prevention | 2 | Two-step logout is good, but Gmail disconnect is one-click destructive with no guard |
| 6 | Recognition Rather Than Recall | 3 | Strong icons per section; back link buried at bottom requires positional memory |
| 7 | Flexibility and Efficiency of Use | 2 | No keyboard shortcuts, no section nav, no accelerators on a long scroll page |
| 8 | Aesthetic and Minimalist Design | 3 | Glass morphism execution is strong; undone by two dead "coming soon" cards consuming space |
| 9 | Error Recovery | 1 | Logout error swallows failure silently; Profile token-wipe has no user notification; no retry on save |
| 10 | Help and Documentation | 2 | Section descriptions exist; no contextual tooltips, no help center link, no explanation of channel mechanics |
| **Total** | | **22/40** | **Acceptable (55%) — significant improvements needed** |

## Design Specificity Verdict

**LLM Assessment:** The Settings page is half Flowr, half template. The Linked Accounts section — with its per-channel Telegram code generation, Gmail receipt parsing with live sync, and channel-state machine — IS the product differentiator rendered in code. That section alone would score high on specificity: it could not be ported to another app without rewriting the channel logic. But the rest of the page — theme toggle, language flags, currency picker, two "coming soon" dead cards, a logout button — is interchangeable settings-page boilerplate. The Profile section component exists in the codebase complete with its own template, styles, and data fetching... but is **never rendered** in `settings.component.html`. A finance app's settings page that hides WHO is logged in is a product identity failure. The page feels like a component demo for LinkedChannelCard with placeholder sections around it, not a holistic authored experience.

**Deterministic Scan:** The detector found **17 issues** — 15 undocumented colors outside the DESIGN.md palette and 2 bounce-easing violations. The convergence with the LLM assessment is strong: Assessment A independently flagged the hardcoded purple gradient in `btn-telegram-auto`, the foreign `#22c55e`/`#ef4444` in the category selector, and the undocumented `rgba(157, 80, 187, ...)` tone scattered across three files. The detector confirmed every one of these with exact line numbers. One mild divergence: Assessment A praised the `justLinkedPop` celebration animation and `ease-spring` curve as feeling "premium without being flashy"; the detector flagged those same `ease-spring` references as bounce-easing violations. This is a legitimate tension — spring easing can feel appropriate for a single celebratory moment (first channel connect), but in a finance tool where "Los números son sagrados" and the design system explicitly warns against decorative motion, spring easing is a slope toward spectacle. The detector is right on principle; the LLM is right that a one-time celebration can earn an exception. The resolution should be: keep the spring for `justLinkedPop` ONLY, but remove it from the hover transition and document the exception in DESIGN.md.

**Visual Overlays:** Browser visualization was not available — the Angular dev server was not running, so no live injection was possible. The report below relies on source-code analysis and the CLI detector scan.

## Overall Impression

The Settings page has a clear peak — the Linked Accounts section is genuinely well-crafted, with a state machine, branded channel treatments, and elegant animation. That's 20% of the page. The other 80% oscillates between placeholder ("coming soon"), standard template (theme/language/currency), and missing identity (no Profile section). The result is a page that opens confidently but collapses into a trust deficit: a personal finance app shipping an empty Security section violates its own second principle. The glass morphism execution is technically solid, but the page structure doesn't earn the visual system it's wrapped in.

**Single biggest opportunity:** Remove the dead sections, surface Profile as the first thing the user sees, and reorganize around what this product actually IS — a channel-first finance tracker. The conventional "Settings page" pattern borrowed from SaaS boilerplate is doing more harm than good here.

## What's Working

1. **LinkedChannelCard state machine.** The disconnected/connecting/connected tri-state is the most polished component on the page. The shimmer skeleton during connection, the green-tinted connected glow with checkmark pop animation, the `justLinkedPop` ring for first-connect celebration, and recent transactions list with live data — this is where real effort was invested, and it shows. The Telegram code-generation flow slotted into the card via `hasCustomDisconnected` + `ng-content` is an elegant composition pattern.

2. **Animation restraint.** The `ftSubtleReveal` directive applies staggered fade-up (50ms → 300ms) with full reduced-motion support (IntersectionObserver one-shot, `prefers-reduced-motion` respected, animations collapsed to instant final state). This is exactly how motion should work in a finance product — a subtle entrance rhythm that yields to accessibility needs. The custom easing curves (`ease-smooth`, `ease-spring`) feel deliberate and premium.

3. **Token discipline (where it holds).** When the codebase reaches for CSS custom properties — `var(--glass-bg)`, `var(--accent-start)`, `var(--text-secondary)`, `var(--radius-md)` — the result is cohesive and themable. The spacing rhythm (4px scale) and typography hierarchy (Space Grotesk headings, Inter body) track the DESIGN.md spec faithfully across roughly 80% of the code. The 20% drift is where the problems hide.

## Priority Issues

### [P0] Logout silently redirects to login on failure

**What:** `onSignOut()` at `settings.component.ts:46-51` has `error: () => this.router.navigate(['/login'])`. If the logout API call fails, the user is redirected to `/login` with no error message, no retry opportunity, and no awareness that the operation failed. Their session token may still be valid server-side.

**Why it matters:** This is a data integrity concern wrapped in a UX failure. A user who sees a login screen after clicking "Sign out" will assume they're logged out — but the server still considers their session active. In a finance app, the user should ALWAYS know the state of their authentication.

**Fix:** On error, keep the user on the Settings page. Set an error signal. Render an inline error message with a retry button. Only navigate to `/login` on successful logout. On error, also call `confirmLogout.set(false)` so the confirmation UI resets.

**Suggested command:** `$impeccable harden`

### [P0] Profile section component exists but is never rendered

**What:** `ProfileSectionComponent` exists at `profile-section.component.ts` with its own template, styles, data fetching (`displayName()`, `email()`), and error handling — but `settings.component.html` has no `<app-profile-section />` element anywhere. The user cannot see who they are on the settings page.

**Why it matters:** In a personal finance app where principle #4 is "Control del usuario — cada número tiene dueño," the user MUST know which account they're configuring. Settings without identity is a security anti-pattern — you're changing preferences for... someone.

**Fix:** Add `<app-profile-section [delay]="0" />` as the first section in `settings.component.html`, before Linked Accounts. This establishes "who you are" before "what you're connected to." The profile card should show display name, email, and ideally an avatar.

**Suggested command:** `$impeccable shape`

### [P1] Security and Notifications as full-size "coming soon" cards undermine trust

**What:** Both `security-section` and `notifications-section` render as full-height glass cards (~200px each) containing only italic gray placeholder text. In a finance app where "Confianza ante todo" is principle #2, an empty Security section is actively harmful.

**Why it matters:** The user reads "Shield icon + Security" and expects to find password settings, 2FA, login sessions, or data controls. Instead they get nothing. This isn't a missing feature — it's a trust signal that backfires. Every day this ships as-is is a day a user questions whether their data is protected.

**Fix:** Remove both sections from the page until they have real content. If they must stay, collapse each into a single-row status indicator (32px, icon + label + "Coming soon" badge) that communicates "we're building this" without consuming prime real estate.

**Suggested command:** `$impeccable distill`

### [P1] Flat-By-Default Rule violations — box-shadows at rest

**What:** DESIGN.md states "A card with a box-shadow before any interaction is a visual bug." `btn-telegram-auto` has `box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3)` at rest. `channel-card__btn--primary` has `box-shadow: 0 2px 10px rgba(217, 70, 239, 0.2)` at rest. `btn-telegram-auto` also hardcodes a foreign gradient outside the palette.

**Why it matters:** The Obsidian Glass system earns its distinctiveness through restraint — glass separates surfaces, not shadows. Every decorative shadow at rest erodes that system. The hardcoded gradient creates a parallel accent color that looks 90% like Amethyst Pulse but isn't, producing subtle but visible inconsistency.

**Fix:** Remove `box-shadow` from the rest state of both buttons. Apply shadows only on `:hover` and `:focus-visible`. Replace the hardcoded gradient with `linear-gradient(135deg, var(--accent-start), var(--accent-mid))`.

**Suggested command:** `$impeccable polish`

### [P2] COP and USD share identical `$` symbol

**What:** In the currency picker, both Colombian Peso (COP) and US Dollar (USD) use `symbol: '$'`. Two currencies, same visual representation — indistinguishable until you read the code label.

**Why it matters:** A user switching between COP and USD — a realistic scenario for Colombian professionals — sees identical `$` symbols and has to check the label to confirm which currency is active. This is a recognition-over-recall failure specifically damaging to the product's Colombian user base.

**Fix:** Use differentiated symbols. Options: `'COP $'`, `'$COL'`, or render a sample formatted amount per currency using `Intl.NumberFormat` so the user sees the actual locale-specific formatting.

**Suggested command:** `$impeccable clarify`

## Persona Red Flags

**Jordan (First-Timer):** Signs up for Flowr, lands on settings. Sees "Security — coming soon" and "Notifications — coming soon" as two of the first things on the page. Has zero context on whether these are critical, when they'll arrive, or whether to worry. There's no onboarding highlight, no "first thing to do" guidance, no progressive disclosure. The channel connection cards — which ARE functional — don't communicate priority. Jordan scrolls an entire page of mixed-quality content and doesn't know what matters.

**Sam (Accessibility):** Keyboard navigation breaks on logout: when `confirmLogout` toggles to `true`, the original "Sign out" button is removed from the DOM and focus drops to the document start — Sam has to re-tab through the entire page to find the confirmation buttons. The theme toggle has `aria-label` but the 9 language/currency flag buttons have no accessible names. The skeleton shimmer animation in channel cards has no `aria-busy` or `aria-live` region. Channel card buttons at 36px violate the 44px touch target rule below 768px.

**Casey (Mobile):** Below 640px, the 3-column flag buttons on a 375px iPhone render very small and are hard to thumb-tap accurately. Channel card action buttons at 36px don't meet the 44px minimum. The logout confirmation UI side-by-side in a 16px-padded container is cramped on a phone screen. The page title dominating at 32px wastes the top third of a mobile viewport before any actionable content appears.

## Minor Observations

- `CategoryDefaultSelectorComponent` uses `ngOnInit()` without importing/implementing `OnInit` — works by JavaScript duck-typing but removes TypeScript compiler safety
- WhatsApp and SMS cards both use `iconKey="chatBubble"` — two different channels are visually indistinguishable until you read the title text
- `.coming-soon` styles are exact duplicates across `security-section.component.scss` and `notifications-section.component.scss` — extract to shared pattern
- `btn-telegram-auto` uses `transform: translateY(-1px)` on hover, which conflicts with the card's own hover lift — potential double-lift
- Settings wrapper uses `ftSubtleReveal` with no explicit `[delay]` — if the directive init is slow, there may be a flash of visible content before the animation plays
- Countdown timer uses `padStart(2, '0')` in a getter — recomputed every change detection cycle

## Questions to Consider

1. If "Los números son sagrados" and the product demands radical simplicity — why is this page shipping two "coming soon" sections instead of 3 fully functional ones? What would an HONEST settings page look like — one that ships what's built and only what's built?

2. The Linked Accounts section is the product differentiator. Should settings be organized AROUND channels (one card = one channel, with its own security/notification/profile controls embedded), rather than the conventional SaaS settings pattern that groups by feature type?

3. The detector found 15 undocumented colors and 2 bounce-easing violations — all concentrated in the Linked Accounts section (the best-designed part of the page). Is the design system too rigid, or is component-level design happening without system-level review?
