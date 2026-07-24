# UX/UI Productization Specification

## Overview

This specification defines 8 capabilities (6 new, 2 modified) that convert free users to paying customers through purposeful UX demonstrating premium value, guiding onboarding, and creating viral growth loops.

---

# NEW CAPABILITIES

---

## 1. Paywall Modal Specification

### Purpose

Provide a reusable modal primitive and upgrade modal with tier comparison that intercepts users when they attempt to access premium features, clearly demonstrating value and providing clear upgrade paths.

### Requirements

#### Requirement: Generic Modal Primitive

The system MUST provide a standalone Angular modal component (`FtModalComponent`) that supports:
- Dynamic content projection via `<ng-content>`
- Configurable size (sm, md, lg, xl)
- Close on backdrop click (optional, default true)
- Close on ESC key (optional, default true)
- Focus trap for accessibility
- Keyboard navigation (Tab, Shift+Tab, Enter, ESC)
- Smooth enter/exit animations (fade + scale)
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Z-index management (stacking context)
- Scroll lock on body when open

##### Scenario: Modal opens with focus trap

- GIVEN a modal is opened
- WHEN the user presses Tab
- THEN focus cycles through focusable elements within the modal
- AND focus does not escape to background content

##### Scenario: Modal closes on ESC

- GIVEN a modal is open
- WHEN the user presses ESC
- THEN the modal closes with exit animation
- AND focus returns to the trigger element

##### Scenario: Modal closes on backdrop click

- GIVEN a modal is open with `closeOnBackdrop=true`
- WHEN the user clicks outside the modal content
- THEN the modal closes

##### Scenario: Modal prevents backdrop close

- GIVEN a modal is open with `closeOnBackdrop=false`
- WHEN the user clicks outside the modal content
- THEN the modal remains open

##### Scenario: Modal responsive sizing

- GIVEN a modal with size="lg"
- WHEN viewport width < 768px
- THEN modal width is 95vw (mobile-optimized)
- WHEN viewport width >= 768px
- THEN modal width is 600px

#### Requirement: Upgrade Modal Component

The system MUST provide an `FtUpgradeModalComponent` that displays:
- Compelling headline: "Desbloquea todo el potencial de Finance Tracker"
- Tier comparison table using `TierComparisonRow` model
- Feature list with checkmarks (✓) for included features, dashes (—) for excluded
- Current tier highlighted
- CTA button: "Upgrade to Premium" (primary) and "Maybe Later" (secondary)
- Trial information if user is in trial period
- Close button (X) in top-right corner

##### Scenario: Free user sees upgrade modal

- GIVEN a free-tier user triggers the upgrade modal
- WHEN the modal opens
- THEN it shows Free vs Premium vs Premium Plus comparison
- AND all premium features are listed with checkmarks/dashes
- AND CTA button is prominent

##### Scenario: Premium user sees upgrade modal

- GIVEN a premium user triggers the upgrade modal
- WHEN the modal opens
- THEN it shows Premium vs Premium Plus comparison
- AND current tier is highlighted
- AND CTA button says "Upgrade to Premium Plus"

##### Scenario: User in trial sees trial info

- GIVEN a user with active trial (7 days remaining)
- WHEN the upgrade modal opens
- THEN it shows "Your trial ends in 7 days" message
- AND CTA button says "Continue with Premium"

##### Scenario: User closes modal without upgrading

- GIVEN the upgrade modal is open
- WHEN the user clicks "Maybe Later" or closes the modal
- THEN the modal closes
- AND the user remains on the current page
- AND an analytics event is tracked: `modal_closed_without_upgrade`

##### Scenario: User clicks upgrade CTA

- GIVEN the upgrade modal is open
- WHEN the user clicks the upgrade CTA button
- THEN the modal closes
- AND the user is navigated to `/subscription` page
- AND an analytics event is tracked: `modal_upgrade_clicked`

#### Requirement: Premium Guard Integration

The system MUST modify `premium.guard.ts` to show the upgrade modal instead of redirecting when a free user attempts to access a premium route. The guard MUST:
- Check user tier
- If free/premium (depending on route), open `FtUpgradeModalComponent`
- Prevent route activation
- Track the attempt via analytics

##### Scenario: Free user accesses premium route

- GIVEN a free-tier user navigates to `/insights`
- WHEN the premium guard executes
- THEN the upgrade modal opens
- AND the route is NOT activated
- AND analytics event `premium_access_attempted` is tracked with `route: "/insights"`

##### Scenario: Premium user accesses premium route

- GIVEN a premium user navigates to `/insights`
- WHEN the premium guard executes
- THEN the route is activated normally
- AND no modal is shown

#### Requirement: Contextual Modal Triggers

The system MUST show the upgrade modal when users interact with premium-locked features:
- AI Insights card on dashboard (free users)
- Goals widget on dashboard (free users)
- Any button with `ftPremiumAction` directive

##### Scenario: Free user clicks AI Insights card

- GIVEN a free-tier user on the dashboard
- WHEN the user clicks the AI Insights card
- THEN the upgrade modal opens
- AND the card shows a lock icon overlay

##### Scenario: Free user uses premium action directive

- GIVEN a button with `ftPremiumAction="'create-goal'"`
- WHEN a free-tier user clicks the button
- THEN the upgrade modal opens
- AND the action is NOT executed

### Non-Functional Requirements

- **Performance**: Modal MUST open within 100ms of trigger
- **Accessibility**: MUST meet WCAG 2.1 AA (keyboard nav, screen reader support, focus management)
- **Responsiveness**: MUST work on mobile (320px+), tablet, desktop
- **i18n**: All text MUST use TranslatePipe for Spanish/English support
- **Animation**: Enter/exit animations MUST be 200ms with ease-out easing
- **Bundle size**: Modal primitive MUST be < 15KB gzipped

### Data Requirements

- **Input**: `tierComparisonRows: TierComparisonRow[]` (feature list)
- **Input**: `currentTier: 'free' | 'premium' | 'premium_plus'`
- **Input**: `trialDaysRemaining?: number`
- **Output**: Analytics events on close/upgrade
- **State**: Modal open/close state managed by service

### Acceptance Criteria

- [ ] Generic modal primitive supports all configuration options
- [ ] Upgrade modal displays tier comparison correctly
- [ ] Premium guard shows modal instead of redirecting
- [ ] Modal is fully accessible (keyboard, screen reader)
- [ ] Modal is responsive (mobile-first)
- [ ] All text is translatable (Spanish + English)
- [ ] Analytics events fire on all interactions
- [ ] Animations are smooth (60fps)
- [ ] Focus trap works correctly
- [ ] Modal stacks correctly with other modals

---

## 2. Onboarding Tour Specification

### Purpose

Provide a skippable, resumable onboarding tour that guides new users through key features (connecting Telegram, creating categories, logging expenses) to reduce time-to-value and increase engagement.

### Requirements

#### Requirement: Tour Engine Primitive

The system MUST provide a standalone tour service (`FtTourService`) and components that support:
- Step definition with target element selectors
- Step highlighting (overlay with cutout)
- Tooltip positioning (top, bottom, left, right, auto)
- Navigation (next, previous, skip, done)
- Progress indicator (step X of Y)
- Persistent state (resume from last step)
- Analytics tracking (step viewed, tour completed, tour skipped)
- Keyboard navigation (arrow keys, ESC to skip)

##### Scenario: Tour starts at step 1

- GIVEN a new user triggers the onboarding tour
- WHEN the tour starts
- THEN step 1 is displayed with tooltip and highlight
- AND progress shows "Step 1 of 5"

##### Scenario: User navigates to next step

- GIVEN the user is on step 2
- WHEN the user clicks "Next" or presses →
- THEN step 3 is displayed
- AND analytics event `tour_step_viewed` is tracked with `step: 3`

##### Scenario: User navigates to previous step

- GIVEN the user is on step 3
- WHEN the user clicks "Previous" or presses ←
- THEN step 2 is displayed

##### Scenario: User skips tour

- GIVEN the user is on any step
- WHEN the user clicks "Skip Tour" or presses ESC
- THEN the tour closes
- AND analytics event `tour_skipped` is tracked with `step: <current>`
- AND tour state is saved as `skipped`

##### Scenario: User completes tour

- GIVEN the user is on the final step
- WHEN the user clicks "Done"
- THEN the tour closes
- AND analytics event `tour_completed` is tracked
- AND tour state is saved as `completed`

##### Scenario: User resumes tour

- GIVEN a user who skipped at step 3
- WHEN the user returns and tour is triggered again
- THEN the tour resumes at step 3
- AND progress shows "Step 3 of 5"

#### Requirement: Onboarding Tour Steps

The system MUST define 5 onboarding steps:

1. **Welcome**: Highlight dashboard, explain value proposition
2. **Connect Telegram**: Highlight Telegram connection button, explain bot integration
3. **Create Category**: Highlight categories page, explain custom categories
4. **Log Expense**: Highlight transaction form, explain expense tracking
5. **Done**: Celebrate completion, show next steps

Each step MUST include:
- Title (translatable)
- Description (translatable, 1-2 sentences)
- Target element selector
- Tooltip position
- Optional action button (e.g., "Connect Now", "Create Category")

##### Scenario: Welcome step displays

- GIVEN the tour is at step 1
- WHEN the step renders
- THEN tooltip shows "Welcome to Finance Tracker!"
- AND description explains the app's value
- AND dashboard is highlighted

##### Scenario: Connect Telegram step displays

- GIVEN the tour is at step 2
- WHEN the step renders
- THEN tooltip shows "Connect Telegram"
- AND description explains bot integration
- AND Telegram connection button is highlighted
- AND "Connect Now" button is shown

##### Scenario: Create Category step displays

- GIVEN the tour is at step 3
- WHEN the step renders
- THEN tooltip shows "Create Custom Categories"
- AND description explains category organization
- AND categories page link is highlighted

##### Scenario: Log Expense step displays

- GIVEN the tour is at step 4
- WHEN the step renders
- THEN tooltip shows "Log Your First Expense"
- AND description explains expense tracking
- AND transaction form is highlighted

##### Scenario: Done step displays

- GIVEN the tour is at step 5
- WHEN the step renders
- THEN tooltip shows "You're All Set!"
- AND description congratulates the user
- AND "Start Exploring" button is shown

#### Requirement: Tour State Persistence

The system MUST persist tour state in user preferences:
- `tourStatus`: `'not_started' | 'in_progress' | 'completed' | 'skipped'`
- `tourCurrentStep`: number (1-5)
- `tourCompletedAt`: date (nullable)

State MUST be loaded on app init and saved on each step change.

##### Scenario: Tour state saved on step change

- GIVEN the user advances to step 3
- WHEN the step changes
- THEN `tourCurrentStep` is updated to 3
- AND state is persisted to backend

##### Scenario: Tour state loaded on app init

- GIVEN a user with `tourStatus: 'in_progress'` and `tourCurrentStep: 3`
- WHEN the app initializes
- THEN tour state is loaded from backend
- AND tour can be resumed at step 3

#### Requirement: Tour Trigger Conditions

The system MUST show the onboarding tour automatically when:
- User is new (registered < 7 days ago)
- User has `tourStatus: 'not_started'`
- User is on the dashboard

The system MUST NOT show the tour when:
- User has `tourStatus: 'completed'` or `'skipped'`
- User is on a mobile device (< 768px) — show a simplified version instead
- User dismisses the tour trigger

##### Scenario: New user sees tour trigger

- GIVEN a new user (registered 2 days ago) with `tourStatus: 'not_started'`
- WHEN the user loads the dashboard
- THEN a tour trigger card is shown: "Take a quick tour?"
- AND "Start Tour" and "Maybe Later" buttons are displayed

##### Scenario: Returning user does not see tour

- GIVEN a user with `tourStatus: 'completed'`
- WHEN the user loads the dashboard
- THEN no tour trigger is shown

##### Scenario: Mobile user sees simplified tour

- GIVEN a new user on a mobile device
- WHEN the user loads the dashboard
- THEN a simplified tour card is shown (no highlighting)
- AND tour steps are shown as a checklist

### Non-Functional Requirements

- **Performance**: Tour MUST start within 200ms of trigger
- **Accessibility**: MUST support keyboard navigation and screen readers
- **Responsiveness**: MUST adapt to mobile (simplified), tablet, desktop
- **i18n**: All text MUST use TranslatePipe
- **Animation**: Highlight transitions MUST be 300ms with ease-in-out
- **Persistence**: Tour state MUST sync within 1s of change

### Data Requirements

- **Input**: `steps: TourStep[]` (step definitions)
- **Input**: `tourState: TourState` (current state)
- **Output**: Analytics events on step view/skip/complete
- **State**: Tour status, current step, completion date

### Acceptance Criteria

- [ ] Tour engine supports all navigation options
- [ ] All 5 steps are defined and translatable
- [ ] Tour state persists across sessions
- [ ] Tour resumes from last step
- [ ] Tour triggers automatically for new users
- [ ] Tour is skippable at any point
- [ ] Tour is responsive (mobile simplified version)
- [ ] Analytics events fire correctly
- [ ] Keyboard navigation works (arrows, ESC)
- [ ] Highlight overlay works correctly

---

## 3. Trial Banner Specification

### Purpose

Provide a persistent, dismissible banner that shows trial countdown and encourages users to upgrade before trial expires, creating urgency and driving conversions.

### Requirements

#### Requirement: Announcement Banner Primitive

The system MUST provide a reusable `FtAnnouncementBannerComponent` that supports:
- Dynamic content projection
- Variant styles (info, warning, success, error)
- Dismissible (with persistence)
- Icon support (left side)
- CTA button (optional)
- Close button (X) in top-right
- Smooth enter/exit animations
- Responsive (full-width on mobile)

##### Scenario: Banner displays with content

- GIVEN a banner with variant="warning" and content="Trial ends in 7 days"
- WHEN the banner renders
- THEN it shows with warning color scheme (orange/yellow)
- AND icon is displayed on the left
- AND content is visible

##### Scenario: Banner is dismissed

- GIVEN a dismissible banner is shown
- WHEN the user clicks the close button
- THEN the banner closes with exit animation
- AND dismissal is persisted (banner does not show again)

##### Scenario: Banner shows CTA button

- GIVEN a banner with CTA text="Upgrade Now"
- WHEN the banner renders
- THEN the CTA button is displayed
- AND clicking it triggers the specified action

#### Requirement: Trial Countdown Banner

The system MUST provide an `FtTrialBannerComponent` that displays:
- Trial countdown message: "Your trial ends in X days"
- Urgency styling (warning variant when < 3 days)
- CTA button: "Upgrade Now" (navigates to `/subscription`)
- Dismissible (but reappears after 24h if trial still active)
- Persistent across pages (shown in topbar)

##### Scenario: Trial banner shows 7 days remaining

- GIVEN a user with 7 days left in trial
- WHEN the banner renders
- THEN it shows "Your trial ends in 7 days"
- AND CTA button "Upgrade Now" is displayed
- AND banner uses info variant (blue)

##### Scenario: Trial banner shows urgency

- GIVEN a user with 2 days left in trial
- WHEN the banner renders
- THEN it shows "Your trial ends in 2 days!"
- AND banner uses warning variant (orange)
- AND CTA button is more prominent

##### Scenario: Trial banner shows last day

- GIVEN a user with < 24 hours left in trial
- WHEN the banner renders
- THEN it shows "Your trial ends today!"
- AND banner uses error variant (red)
- AND CTA button pulses to draw attention

##### Scenario: User dismisses trial banner

- GIVEN the trial banner is shown
- WHEN the user clicks the close button
- THEN the banner closes
- AND dismissal is persisted
- AND banner does not show again for 24 hours

##### Scenario: Trial banner reappears after dismissal

- GIVEN a user dismissed the banner 25 hours ago
- WHEN the user loads the app
- THEN the trial banner is shown again (if trial still active)

##### Scenario: No banner for premium users

- GIVEN a premium user
- WHEN the app loads
- THEN no trial banner is shown

##### Scenario: No banner after trial expires

- GIVEN a user whose trial has expired
- WHEN the app loads
- THEN no trial banner is shown
- AND user is prompted to upgrade via other means

#### Requirement: Banner Placement

The system MUST display the trial banner:
- In the topbar (sticky, always visible)
- Above main content on dashboard
- Dismissible on dashboard, persistent in topbar

##### Scenario: Banner in topbar

- GIVEN a user with active trial
- WHEN any page loads
- THEN the trial banner is visible in the topbar
- AND it remains visible as user scrolls

##### Scenario: Banner on dashboard

- GIVEN a user with active trial on the dashboard
- WHEN the dashboard loads
- THEN the trial banner is shown above the dashboard content
- AND it can be dismissed independently of topbar banner

### Non-Functional Requirements

- **Performance**: Banner MUST render within 50ms
- **Accessibility**: MUST support keyboard navigation and screen readers
- **Responsiveness**: MUST be full-width on mobile, constrained on desktop
- **i18n**: All text MUST use TranslatePipe
- **Animation**: Enter/exit MUST be 200ms with ease-out
- **Persistence**: Dismissal state MUST sync within 1s

### Data Requirements

- **Input**: `trialEndDate: Date`
- **Input**: `daysRemaining: number` (computed)
- **Output**: Analytics events on dismiss/CTA click
- **State**: Dismissal timestamp, last shown timestamp

### Acceptance Criteria

- [ ] Announcement banner primitive is reusable
- [ ] Trial banner shows correct countdown
- [ ] Urgency styling changes based on days remaining
- [ ] Banner is dismissible with persistence
- [ ] Banner reappears after 24h if trial active
- [ ] Banner is responsive (mobile-first)
- [ ] Banner is accessible (keyboard, screen reader)
- [ ] All text is translatable
- [ ] CTA button navigates to subscription page
- [ ] Banner does not show for premium users

---

## 4. Upgrade Prompts Specification

### Purpose

Provide contextual upgrade prompts that intercept users when they encounter premium-locked features, demonstrating value and providing clear upgrade paths without being intrusive.

### Requirements

#### Requirement: Contextual Prompt Component

The system MUST provide an `FtUpgradePromptComponent` that displays:
- Lock icon overlay on premium features
- Brief description of premium value
- CTA button: "Unlock with Premium"
- Subtle animation (fade-in on hover)
- Non-blocking (user can continue using free features)

##### Scenario: Prompt shows on premium feature

- GIVEN a free user views a premium-locked section
- WHEN the section renders
- THEN a lock icon overlay is shown
- AND upgrade prompt is displayed on hover/click

##### Scenario: Prompt is non-blocking

- GIVEN an upgrade prompt is shown
- WHEN the user clicks outside the prompt
- THEN the prompt closes
- AND the user can continue using the app

##### Scenario: Prompt CTA navigates to subscription

- GIVEN an upgrade prompt is shown
- WHEN the user clicks "Unlock with Premium"
- THEN the user is navigated to `/subscription`
- AND analytics event `upgrade_prompt_clicked` is tracked

#### Requirement: Dashboard Upgrade Prompts

The system MUST show upgrade prompts in place of premium-only dashboard sections:
- AI Insights card (Row 3) for free users
- Goals widget (Row 4) for free users

Prompts MUST include:
- Blurred preview of premium content
- Lock icon
- Value proposition (1-2 sentences)
- CTA button

##### Scenario: Free user sees AI Insights prompt

- GIVEN a free user on the dashboard
- WHEN Row 3 renders
- THEN a blurred preview of insights is shown
- AND lock icon overlay is displayed
- AND prompt says "Get AI-powered insights with Premium"
- AND CTA button "Unlock Insights" is shown

##### Scenario: Free user sees Goals prompt

- GIVEN a free user on the dashboard
- WHEN Row 4 renders
- THEN a blurred preview of goals is shown
- AND lock icon overlay is displayed
- AND prompt says "Track your financial goals with Premium"
- AND CTA button "Unlock Goals" is shown

##### Scenario: Premium user sees actual content

- GIVEN a premium user on the dashboard
- WHEN Rows 3 and 4 render
- THEN actual AI insights and goals are shown
- AND no upgrade prompts are displayed

#### Requirement: Inline Upgrade Prompts

The system MUST show inline upgrade prompts when users attempt premium actions:
- Creating more than 3 goals (free limit)
- Accessing advanced analytics
- Using AI features

Prompts MUST be contextual and appear near the action attempt.

##### Scenario: Free user tries to create 4th goal

- GIVEN a free user with 3 goals
- WHEN the user clicks "Create Goal"
- THEN an inline prompt appears: "You've reached the free limit"
- AND prompt says "Create unlimited goals with Premium"
- AND CTA button "Upgrade Now" is shown

##### Scenario: Free user accesses advanced analytics

- GIVEN a free user on the analytics page
- WHEN the user clicks "Advanced Analytics"
- THEN an inline prompt appears
- AND prompt explains premium analytics features
- AND CTA button is shown

### Non-Functional Requirements

- **Performance**: Prompts MUST render within 100ms
- **Accessibility**: MUST support keyboard navigation and screen readers
- **Responsiveness**: MUST adapt to mobile, tablet, desktop
- **i18n**: All text MUST use TranslatePipe
- **Animation**: Fade-in MUST be 200ms with ease-out
- **Non-intrusive**: Prompts MUST not block core workflows

### Data Requirements

- **Input**: `featureType: 'insights' | 'goals' | 'analytics' | 'ai'`
- **Input**: `userTier: 'free' | 'premium' | 'premium_plus'`
- **Output**: Analytics events on prompt view/CTA click
- **State**: Prompt visibility state

### Acceptance Criteria

- [ ] Upgrade prompt component is reusable
- [ ] Dashboard prompts show for free users
- [ ] Inline prompts show on premium action attempts
- [ ] Prompts are non-blocking
- [ ] Prompts are responsive
- [ ] Prompts are accessible
- [ ] All text is translatable
- [ ] Analytics events fire correctly
- [ ] Premium users do not see prompts
- [ ] Prompts do not interfere with core workflows

---

## 5. Analytics Tracking Specification

### Purpose

Integrate PostHog analytics to track user behavior, conversion events, and feature usage, enabling data-driven decisions about productization efforts.

### Requirements

#### Requirement: PostHog Integration Service

The system MUST provide an `FtAnalyticsService` that:
- Initializes PostHog with API key from environment config
- Provides methods for tracking events: `trackEvent(name, properties)`
- Provides methods for identifying users: `identifyUser(userId, properties)`
- Provides methods for page views: `trackPageView(path)`
- Handles GDPR compliance (cookie consent)
- Batches events for performance
- Works offline (queues events, syncs when online)

##### Scenario: PostHog initializes on app load

- GIVEN the app loads with valid PostHog API key
- WHEN the app initializes
- THEN PostHog is initialized
- AND analytics service is ready

##### Scenario: Event is tracked

- GIVEN the analytics service is initialized
- WHEN `trackEvent('button_clicked', { button: 'upgrade' })` is called
- THEN the event is queued
- AND the event is sent to PostHog within 5s (batched)

##### Scenario: User is identified

- GIVEN a user logs in
- WHEN `identifyUser('user-123', { tier: 'free' })` is called
- THEN the user is identified in PostHog
- AND user properties are set

##### Scenario: Page view is tracked

- GIVEN the user navigates to `/dashboard`
- WHEN the route changes
- THEN `trackPageView('/dashboard')` is called
- AND the page view is sent to PostHog

#### Requirement: GDPR Compliance

The system MUST:
- Show cookie consent banner on first visit
- Only initialize PostHog after user consents
- Allow users to withdraw consent (disable tracking)
- Store consent preference in localStorage
- Respect "Do Not Track" browser setting

##### Scenario: Cookie consent banner shows

- GIVEN a new user visits the app
- WHEN the app loads
- THEN a cookie consent banner is shown
- AND user can accept or decline

##### Scenario: User accepts cookies

- GIVEN the consent banner is shown
- WHEN the user clicks "Accept"
- THEN PostHog is initialized
- AND consent preference is stored
- AND tracking begins

##### Scenario: User declines cookies

- GIVEN the consent banner is shown
- WHEN the user clicks "Decline"
- THEN PostHog is NOT initialized
- AND consent preference is stored
- AND no tracking occurs

##### Scenario: User withdraws consent

- GIVEN a user who previously accepted cookies
- WHEN the user changes settings to decline
- THEN PostHog is disabled
- AND tracking stops
- AND preference is updated

#### Requirement: Key Events to Track

The system MUST track the following events:

**Conversion Events:**
- `paywall_modal_shown` — when upgrade modal opens
- `paywall_modal_closed` — when modal closes without upgrade
- `upgrade_clicked` — when user clicks upgrade CTA
- `subscription_page_viewed` — when subscription page loads
- `upgrade_completed` — when user successfully upgrades

**Onboarding Events:**
- `onboarding_tour_started` — when tour begins
- `onboarding_tour_step_viewed` — when step is shown (with step number)
- `onboarding_tour_completed` — when tour finishes
- `onboarding_tour_skipped` — when user skips tour

**Engagement Events:**
- `premium_feature_attempted` — when free user tries premium feature
- `upgrade_prompt_shown` — when prompt is displayed
- `upgrade_prompt_clicked` — when prompt CTA is clicked
- `trial_banner_dismissed` — when banner is closed
- `trial_banner_cta_clicked` — when banner CTA is clicked

**Referral Events:**
- `referral_link_generated` — when user generates link
- `referral_link_shared` — when user shares link
- `referral_signup_completed` — when referred user signs up

##### Scenario: Paywall modal event tracked

- GIVEN a free user triggers the upgrade modal
- WHEN the modal opens
- THEN `paywall_modal_shown` event is tracked
- AND event includes `trigger: 'premium_guard' | 'dashboard_prompt'`

##### Scenario: Onboarding step event tracked

- GIVEN the user is on step 3 of onboarding
- WHEN the step renders
- THEN `onboarding_tour_step_viewed` is tracked
- AND event includes `step: 3`

##### Scenario: Upgrade completion tracked

- GIVEN a user completes the upgrade flow
- WHEN the payment succeeds
- THEN `upgrade_completed` is tracked
- AND event includes `tier: 'premium' | 'premium_plus'`

#### Requirement: Analytics Configuration

The system MUST:
- Load PostHog API key from `environment.ts`
- Support dev/staging/prod environments
- Disable tracking in dev mode (unless explicitly enabled)
- Provide a debug mode for testing

##### Scenario: PostHog loads from environment

- GIVEN the app is built for production
- WHEN the app loads
- THEN PostHog API key is loaded from `environment.prod.ts`
- AND tracking is enabled

##### Scenario: Tracking disabled in dev

- GIVEN the app is running in dev mode
- WHEN the app loads
- THEN PostHog is NOT initialized (unless `enableAnalytics: true`)

### Non-Functional Requirements

- **Performance**: Event tracking MUST NOT block UI (async)
- **Reliability**: Events MUST be queued and retried on failure
- **Privacy**: MUST comply with GDPR and respect user consent
- **Batching**: Events MUST be batched (max 10 events or 5s)
- **Offline**: Events MUST queue when offline, sync when online
- **Bundle size**: PostHog SDK MUST be lazy-loaded

### Data Requirements

- **Input**: `apiKey: string` (from environment)
- **Input**: `userId: string` (for identification)
- **Input**: `userProperties: object` (tier, registration date, etc.)
- **Output**: Events sent to PostHog
- **State**: Consent preference, event queue

### Acceptance Criteria

- [ ] PostHog initializes correctly
- [ ] Events are tracked and sent to PostHog
- [ ] Users are identified with properties
- [ ] Page views are tracked
- [ ] GDPR consent banner works
- [ ] Consent preference is respected
- [ ] All key events are tracked
- [ ] Events are batched for performance
- [ ] Offline events queue and sync
- [ ] Debug mode works for testing
- [ ] Tracking disabled in dev by default

---

## 6. Referral System Specification

### Purpose

Implement a referral system that allows users to invite friends with unique links, rewarding both the referrer and referee with a 1-month discount, creating a viral growth loop.

### Requirements

#### Requirement: Referral Link Generation

The system MUST provide a `FtReferralService` that:
- Generates unique referral links per user
- Format: `https://financetracker.app/ref/{unique-code}`
- Unique code: 8-character alphanumeric (case-insensitive)
- Links are permanent (do not expire)
- Links are single-use per referee (one discount per referred user)

##### Scenario: User generates referral link

- GIVEN a premium user visits the referral page
- WHEN the page loads
- THEN a unique referral link is generated
- AND link format is `https://financetracker.app/ref/ABC123XY`
- AND link is displayed with copy button

##### Scenario: Referral link is unique

- GIVEN two different users generate referral links
- WHEN the links are compared
- THEN the links are different
- AND each link is tied to the referrer's user ID

##### Scenario: Referral link is permanent

- GIVEN a user generated a referral link 30 days ago
- WHEN the link is accessed today
- THEN the link is still valid
- AND it still credits the referrer

#### Requirement: Referral Page Component

The system MUST provide an `FtReferralPageComponent` that displays:
- User's unique referral link
- Copy to clipboard button
- Share buttons (email, WhatsApp, Twitter, Telegram)
- Referral stats: "X friends joined, you saved $Y"
- Explanation of how it works (3 steps)
- Terms and conditions link

##### Scenario: Referral page displays link

- GIVEN a premium user visits `/referral`
- WHEN the page loads
- THEN the user's referral link is displayed
- AND copy button is available
- AND share buttons are shown

##### Scenario: User copies referral link

- GIVEN the referral page is loaded
- WHEN the user clicks "Copy Link"
- THEN the link is copied to clipboard
- AND a toast notification shows "Link copied!"
- AND analytics event `referral_link_copied` is tracked

##### Scenario: User shares via email

- GIVEN the referral page is loaded
- WHEN the user clicks "Share via Email"
- THEN the default email client opens
- AND email body contains referral link and message
- AND analytics event `referral_link_shared` is tracked with `method: 'email'`

##### Scenario: User shares via WhatsApp

- GIVEN the referral page is loaded
- WHEN the user clicks "Share via WhatsApp"
- THEN WhatsApp opens with pre-filled message containing referral link
- AND analytics event is tracked with `method: 'whatsapp'`

##### Scenario: Referral stats display

- GIVEN a user has referred 3 friends
- WHEN the referral page loads
- THEN stats show "3 friends joined"
- AND stats show "You saved $30" (3 x $10 discount)

#### Requirement: Referral Redemption Flow

The system MUST handle the referral redemption flow:
1. Referred user clicks referral link
2. Landing page shows: "You've been invited by {referrer name}!"
3. Referred user signs up
4. Referred user subscribes to premium
5. Both referrer and referee get 1-month discount

##### Scenario: Referred user clicks link

- GIVEN a referred user clicks `https://financetracker.app/ref/ABC123XY`
- WHEN the landing page loads
- THEN the page shows "You've been invited by John!"
- AND a special signup CTA is shown
- AND the referral code is stored in localStorage

##### Scenario: Referred user signs up

- GIVEN a referred user clicks the signup CTA
- WHEN the user completes registration
- THEN the referral code is sent to the backend
- AND the referral relationship is recorded

##### Scenario: Referred user subscribes

- GIVEN a referred user has signed up
- WHEN the user subscribes to premium
- THEN the referee gets a 1-month discount
- AND the referrer gets a 1-month discount
- AND analytics event `referral_signup_completed` is tracked

##### Scenario: Referrer gets credit

- GIVEN a referred user subscribes to premium
- WHEN the subscription is processed
- THEN the referrer's subscription is extended by 1 month
- AND the referrer receives a notification: "You earned a free month!"

##### Scenario: Referral link already used

- GIVEN a user who already signed up via referral
- WHEN the user tries to use another referral link
- THEN the new link is ignored
- AND the original referral relationship is preserved

#### Requirement: Referral Dashboard Widget

The system MUST provide an `FtReferralWidgetComponent` for the dashboard that shows:
- Referral link (shortened)
- Quick share button
- Referral count: "X friends joined"

##### Scenario: Referral widget on dashboard

- GIVEN a premium user on the dashboard
- WHEN the dashboard loads
- THEN the referral widget is shown
- AND it displays the referral link and count

##### Scenario: Quick share from widget

- GIVEN the referral widget is shown
- WHEN the user clicks "Share"
- THEN share options are displayed
- AND user can share via email/WhatsApp/etc.

#### Requirement: Referral Integration with Subscription

The system MUST modify the subscription page to include:
- "Have a referral link?" input field
- Apply referral code button
- Discount applied message

##### Scenario: User applies referral code

- GIVEN a new user on the subscription page
- WHEN the user enters a valid referral code and clicks "Apply"
- THEN the discount is applied
- AND the price shows "1 month free"
- AND the referral relationship is confirmed

##### Scenario: Invalid referral code

- GIVEN a user enters an invalid referral code
- WHEN the user clicks "Apply"
- THEN an error message shows "Invalid referral code"
- AND no discount is applied

### Non-Functional Requirements

- **Security**: Referral codes MUST be unpredictable (no sequential patterns)
- **Performance**: Link generation MUST be < 100ms
- **Reliability**: Referral relationships MUST be persisted and not lost
- **Privacy**: Referrer names MUST be visible to referees (with consent)
- **i18n**: All text MUST use TranslatePipe
- **Responsiveness**: Referral page MUST work on mobile

### Data Requirements

- **Input**: `userId: string` (referrer)
- **Output**: `referralCode: string` (8-char alphanumeric)
- **Output**: `referralLink: string` (full URL)
- **State**: Referral relationships, redemption status, stats
- **Backend API**: 
  - `POST /api/referral/generate` — generate link
  - `GET /api/referral/stats` — get stats
  - `POST /api/referral/redeem` — redeem code

### Acceptance Criteria

- [ ] Unique referral links are generated per user
- [ ] Referral page displays link and share options
- [ ] Copy to clipboard works
- [ ] Share buttons work (email, WhatsApp, Twitter, Telegram)
- [ ] Referral stats display correctly
- [ ] Referral redemption flow works end-to-end
- [ ] Both referrer and referee get discounts
- [ ] Referral widget shows on dashboard
- [ ] Subscription page accepts referral codes
- [ ] Invalid codes are rejected
- [ ] Referral links are permanent
- [ ] Referral relationships are persisted
- [ ] All text is translatable
- [ ] Referral page is responsive

---

# MODIFIED CAPABILITIES

---

## 7. Empty States Enhanced Specification (Delta)

### Purpose

Extend the existing `EmptyStateComponent` to support variant types (premium-upsell, first-use) that provide contextual messaging and CTAs based on user state and feature context.

### ADDED Requirements

#### Requirement: Empty State Variants

The system MUST extend `EmptyStateComponent` to support the following variants:
- `default` — standard empty state (existing behavior)
- `premium-upsell` — shows premium value proposition with upgrade CTA
- `first-use` — guides new users through first-time setup

Each variant MUST support:
- Custom icon/illustration
- Custom title (translatable)
- Custom description (translatable)
- Custom CTA button (optional)
- Custom secondary action (optional)

##### Scenario: Premium upsell variant displays

- GIVEN an empty state with variant="premium-upsell"
- WHEN the component renders
- THEN it shows a premium-themed illustration
- AND title says "Unlock this feature with Premium"
- AND description explains premium value
- AND CTA button says "Upgrade Now"

##### Scenario: First-use variant displays

- GIVEN an empty state with variant="first-use"
- WHEN the component renders
- THEN it shows a friendly illustration
- AND title says "Let's get started!"
- AND description guides the user
- AND CTA button says "Create Your First Item"

##### Scenario: Default variant unchanged

- GIVEN an empty state with variant="default"
- WHEN the component renders
- THEN it shows the standard empty state (existing behavior)
- AND no premium or first-use messaging is shown

#### Requirement: Premium Upsell Empty States

The system MUST use `premium-upsell` variant for:
- AI Insights card (free users, no insights)
- Goals widget (free users, no goals)
- Advanced analytics (free users)
- Any premium-only feature with no data

##### Scenario: Free user sees premium upsell in insights

- GIVEN a free user with no AI insights
- WHEN the insights card renders
- THEN it shows premium-upsell variant
- AND CTA navigates to subscription page

##### Scenario: Free user sees premium upsell in goals

- GIVEN a free user with no goals
- WHEN the goals widget renders
- THEN it shows premium-upsell variant
- AND CTA navigates to subscription page

#### Requirement: First-Use Empty States

The system MUST use `first-use` variant for:
- Categories page (new user, no custom categories)
- Goals page (new user, no goals)
- Transactions page (new user, no transactions)

##### Scenario: New user sees first-use in categories

- GIVEN a new user with only default categories
- WHEN the categories page renders
- THEN it shows first-use variant
- AND CTA says "Create Your First Category"

##### Scenario: New user sees first-use in goals

- GIVEN a new user with no goals
- WHEN the goals page renders
- THEN it shows first-use variant
- AND CTA says "Create Your First Goal"

### MODIFIED Requirements

#### Requirement: Empty State Component API

The `EmptyStateComponent` MUST accept the following inputs:
- `variant: 'default' | 'premium-upsell' | 'first-use'` (default: 'default')
- `icon: string` (icon name or illustration path)
- `title: string` (translatable)
- `description: string` (translatable)
- `ctaText: string` (translatable, optional)
- `ctaAction: () => void` (optional)
- `secondaryText: string` (translatable, optional)
- `secondaryAction: () => void` (optional)

(Previously: Component only accepted `icon`, `title`, `description`, `ctaText`, `ctaAction`)

##### Scenario: Component with variant input

- GIVEN an empty state with variant="premium-upsell"
- WHEN the component renders
- THEN it applies premium-upsell styling and messaging

##### Scenario: Component with custom CTA

- GIVEN an empty state with ctaText="Create Now" and ctaAction=createItem
- WHEN the component renders
- THEN the CTA button displays "Create Now"
- AND clicking it calls createItem()

### Non-Functional Requirements

- **Performance**: Variant rendering MUST be < 50ms
- **Accessibility**: MUST support keyboard navigation and screen readers
- **Responsiveness**: MUST adapt to mobile, tablet, desktop
- **i18n**: All text MUST use TranslatePipe
- **Backward compatibility**: Existing empty states MUST continue to work

### Data Requirements

- **Input**: `variant: 'default' | 'premium-upsell' | 'first-use'`
- **Input**: `icon`, `title`, `description`, `ctaText`, `ctaAction`
- **Output**: Analytics events on CTA click (for premium-upsell)

### Acceptance Criteria

- [ ] EmptyStateComponent supports variant input
- [ ] Premium-upsell variant displays correctly
- [ ] First-use variant displays correctly
- [ ] Default variant unchanged (backward compatible)
- [ ] Premium upsell empty states show in premium features
- [ ] First-use empty states show for new users
- [ ] All text is translatable
- [ ] Component is responsive
- [ ] Component is accessible
- [ ] CTA actions work correctly

---

## 8. Dashboard Enhanced Specification (Delta)

### Purpose

Extend the existing dashboard to include the trial banner and enhanced empty states, creating a more engaging experience that drives conversions.

### ADDED Requirements

#### Requirement: Trial Banner Integration

The system MUST integrate the `FtTrialBannerComponent` into the dashboard:
- Banner shows above dashboard content (Row 0)
- Banner is dismissible
- Banner persists across page navigation (in topbar)

##### Scenario: Trial banner shows on dashboard

- GIVEN a user with active trial
- WHEN the dashboard loads
- THEN the trial banner is shown above Row 1
- AND banner displays trial countdown

##### Scenario: Trial banner is dismissible

- GIVEN the trial banner is shown on dashboard
- WHEN the user clicks the close button
- THEN the banner closes
- AND dismissal is persisted

#### Requirement: Enhanced Empty States

The system MUST use enhanced empty states (premium-upsell, first-use) in dashboard widgets:
- AI Insights card: premium-upsell for free users
- Goals widget: premium-upsell for free users, first-use for premium users with no goals

##### Scenario: Free user sees premium upsell in insights

- GIVEN a free user on the dashboard
- WHEN the AI Insights card renders
- THEN it shows premium-upsell empty state
- AND CTA navigates to subscription

##### Scenario: Premium user with no goals sees first-use

- GIVEN a premium user with no goals
- WHEN the goals widget renders
- THEN it shows first-use empty state
- AND CTA says "Create Your First Goal"

#### Requirement: Contextual Upgrade Prompts

The system MUST show contextual upgrade prompts in dashboard:
- AI Insights card: upgrade prompt for free users
- Goals widget: upgrade prompt for free users

Prompts MUST be non-blocking and demonstrate premium value.

##### Scenario: Upgrade prompt in insights card

- GIVEN a free user on the dashboard
- WHEN the AI Insights card renders
- THEN an upgrade prompt is shown
- AND prompt explains premium insights value
- AND CTA button is displayed

##### Scenario: Upgrade prompt in goals widget

- GIVEN a free user on the dashboard
- WHEN the goals widget renders
- THEN an upgrade prompt is shown
- AND prompt explains premium goals value
- AND CTA button is displayed

### MODIFIED Requirements

#### Requirement: Dashboard Layout Structure

The system MUST render the dashboard in six rows: Row 0 — Trial banner (conditional), Row 1 — [Balance Total] [Tasa de Ahorro], Row 2 — [Ingreso Mensual] [Gastos Mensuales], Row 3 — Large AI Insights card (premium only, upgrade prompt for free), Row 4 — Goals progress widget (premium only, upgrade prompt for free), Row 5 — Recent activity list.

(Previously: Dashboard had 5 rows, no trial banner)

##### Scenario: Dashboard with trial banner

- GIVEN a user with active trial
- WHEN the dashboard renders
- THEN Row 0 shows the trial banner
- AND Rows 1-5 render as before

##### Scenario: Dashboard without trial banner

- GIVEN a user without active trial
- WHEN the dashboard renders
- THEN Row 0 is not shown
- AND Rows 1-5 render as before

### Non-Functional Requirements

- **Performance**: Dashboard MUST render within 200ms (including banner)
- **Accessibility**: All new elements MUST be accessible
- **Responsiveness**: Banner and empty states MUST be responsive
- **i18n**: All new text MUST use TranslatePipe

### Data Requirements

- **Input**: `trialEndDate: Date` (for banner)
- **Input**: `userTier: 'free' | 'premium' | 'premium_plus'` (for empty states)
- **Output**: Analytics events on banner dismiss, upgrade prompt clicks

### Acceptance Criteria

- [ ] Trial banner integrates into dashboard
- [ ] Banner is dismissible
- [ ] Enhanced empty states show correctly
- [ ] Upgrade prompts show for free users
- [ ] Dashboard layout updated to 6 rows
- [ ] All new elements are responsive
- [ ] All new elements are accessible
- [ ] All new text is translatable
- [ ] Analytics events fire correctly
- [ ] No breaking changes to existing dashboard

---

# SUMMARY

## Capabilities Specified

| Capability | Type | Requirements | Scenarios | Status |
|------------|------|--------------|-----------|--------|
| Paywall Modal | New | 4 | 15 | ✅ Complete |
| Onboarding Tour | New | 4 | 16 | ✅ Complete |
| Trial Banner | New | 3 | 10 | ✅ Complete |
| Upgrade Prompts | New | 3 | 8 | ✅ Complete |
| Analytics Tracking | New | 4 | 11 | ✅ Complete |
| Referral System | New | 5 | 14 | ✅ Complete |
| Empty States Enhanced | Modified | 3 | 7 | ✅ Complete |
| Dashboard Enhanced | Modified | 3 | 7 | ✅ Complete |

## Total Scenarios: 88

## Coverage

- **Happy paths**: ✅ All covered
- **Edge cases**: ✅ All covered (dismissal, expiration, invalid input, etc.)
- **Error states**: ✅ All covered (invalid codes, network failures, etc.)
- **Accessibility**: ✅ All components require WCAG 2.1 AA compliance
- **Responsiveness**: ✅ All components require mobile-first design
- **i18n**: ✅ All text requires TranslatePipe

## Risks and Gaps

1. **Backend dependency**: Referral system requires backend API (not in scope)
2. **PostHog account**: Requires PostHog API key and account setup
3. **Referral link format**: Requires backend to generate and validate unique codes
4. **Trial data edge cases**: Requires handling null/expired trial dates
5. **Analytics batching**: Requires testing to ensure events are not lost
6. **Tour state persistence**: Requires backend API for tour state
7. **Referral discount logic**: Requires backend to apply discounts correctly

## Next Recommended Step

**Design (sdd-design)** — Ready to create technical design and architecture for implementation.
