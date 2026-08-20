# Delta for Settings Page

## ADDED Requirements

### Requirement: Profile Identity Visible First

The system SHALL render `app-profile-section` as the first element on the Settings page.

(Previously: Profile section was not rendered on Settings page — profile was only accessible via topbar dropdown.)

#### Scenario: Profile renders as first element

- GIVEN user navigates to `/settings`
- WHEN the page renders
- THEN `app-profile-section` appears before any configuration section
- AND its `ftSubtleReveal` animation uses `[delay]="25"`

#### Scenario: Display name and email are visible

- GIVEN the profile section has loaded
- WHEN user views the Settings page
- THEN user sees their display name and email

### Requirement: Dead Sections Removed

The system MUST NOT render `app-security-section` or `app-notifications-section`. Their imports SHALL be removed from `settings.component.ts`.

#### Scenario: Security and notifications are absent

- GIVEN user navigates to `/settings`
- WHEN the template renders
- THEN no "coming soon" security or notifications sections are visible in the DOM

#### Scenario: Imports cleaned up

- GIVEN `settings.component.ts` is compiled
- WHEN the compiler resolves imports
- THEN `SecuritySectionComponent` and `NotificationsSectionComponent` are not imported

### Requirement: Preferences in Inline Drawer

The system SHALL display `app-preferences-section` inside a right-side inline drawer (380px) toggled by a gear icon in the page header.

#### Scenario: Drawer opens on gear click

- GIVEN the Settings page is rendered
- WHEN user clicks the gear icon button
- THEN a 380px right-side drawer slides in
- AND `app-preferences-section` renders with `[delay]="0"`
- AND body scroll is locked

#### Scenario: Drawer closes on backdrop click

- GIVEN the preferences drawer is open
- WHEN user clicks the backdrop overlay
- THEN the drawer closes

#### Scenario: Drawer closes on ESC key

- GIVEN the preferences drawer is open
- WHEN user presses the Escape key
- THEN the drawer closes

#### Scenario: Drawer closes on close button

- GIVEN the preferences drawer is open
- WHEN user clicks the explicit close button (×) inside the drawer
- THEN the drawer closes

#### Scenario: Toggle reopens drawer

- GIVEN the drawer was closed
- WHEN user clicks the gear icon again
- THEN the drawer reopens

### Requirement: Channels as Primary Content

The system SHALL render `app-linked-accounts-section` immediately after profile as the primary content.

#### Scenario: Linked accounts render after profile

- GIVEN the Settings page is loaded
- WHEN the DOM renders
- THEN `app-linked-accounts-section` appears directly after `app-profile-section`

#### Scenario: All channel cards are visible

- GIVEN the linked accounts section renders
- WHEN user scrolls through
- THEN Telegram, Gmail, WhatsApp, and SMS channel cards are visible and functional

### Requirement: Session and Navigation Preserved

The system SHALL preserve the logout section and dashboard back-link at page bottom, unchanged.

#### Scenario: Logout two-step confirmation works

- GIVEN user clicks "Sign out"
- WHEN the confirmation prompt appears
- THEN user can cancel or confirm
- AND log out clears the session and redirects to `/login`

#### Scenario: Logout error handled

- GIVEN the logout API call fails
- WHEN the error response arrives
- THEN an error message is displayed
- AND user can retry or cancel

#### Scenario: Back link navigates to dashboard

- GIVEN the Settings page is rendered
- WHEN user clicks the back link at the bottom
- THEN the app navigates to `/dashboard`

### Requirement: Page Header with Gear Icon

The system SHALL render a header row containing the page title "Settings" and a gear icon button.

#### Scenario: Header renders title and icon

- GIVEN user navigates to `/settings`
- WHEN the page renders
- THEN a header row displays the title "Settings"
- AND a gear icon button using `ng-icon name="settings"` is visible

#### Scenario: Gear click toggles drawer signal

- GIVEN the header is rendered
- WHEN user clicks the gear icon
- THEN the `showPreferencesDrawer` signal toggles between `true` and `false`
