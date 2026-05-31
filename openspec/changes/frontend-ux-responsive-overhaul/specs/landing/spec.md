# Delta for landing

## ADDED Requirements

### Requirement: Mobile Navbar Responsiveness

The system SHALL render the landing page navbar with a collapsible hamburger menu at viewports below 768px, keeping the logo and primary CTA always visible.

#### Scenario: Hamburger menu appears on mobile

- GIVEN viewport is below 768px
- WHEN the landing navbar renders
- THEN secondary navigation items collapse behind a hamburger menu toggle

#### Scenario: Logo and CTA remain visible

- GIVEN viewport is 320px
- WHEN the landing navbar renders
- THEN the logo and primary CTA button are visible without opening the menu

#### Scenario: Menu toggle expands/collapses

- GIVEN viewport is below 768px and menu is collapsed
- WHEN user taps the hamburger toggle
- THEN secondary actions expand; tapping again collapses them

### Requirement: CTA Button Mobile Visibility

The system SHALL ensure the primary CTA button remains visible, tappable (minimum 44x44px), and properly styled at all viewport sizes down to 320px.

#### Scenario: CTA is tappable at 320px

- GIVEN viewport is 320px
- WHEN the CTA button renders
- THEN it is visible and has a minimum touch target of 44x44px

#### Scenario: CTA does not overlap logo

- GIVEN viewport is 320px
- WHEN the navbar renders
- THEN the CTA button does not overlap or obscure the logo

### Requirement: Language Dropdown Mobile Compatibility

The system SHALL ensure the landing page language dropdown (globe icon) works correctly on mobile viewports, opening without overflow and fitting within the screen.

#### Scenario: Language dropdown opens on mobile tap

- GIVEN viewport is below 768px
- WHEN user taps the globe icon in the landing navbar
- THEN the language dropdown opens with ES, EN, FR options visible

#### Scenario: Language dropdown fits 320px screen

- GIVEN viewport is 320px
- WHEN the language dropdown is open
- THEN all options are visible without horizontal scrolling or off-screen content

### Requirement: Sign In Mobile Adaptation

The system SHALL replace the "Sign In" text with a user icon on mobile viewports to save horizontal space.

#### Scenario: Sign In becomes icon on mobile

- GIVEN viewport is below 768px
- WHEN the landing navbar renders
- THEN the "Sign In" text is replaced with a user icon

#### Scenario: Sign In text visible on desktop

- GIVEN viewport is 768px or above
- WHEN the landing navbar renders
- THEN the "Sign In" text is fully visible
