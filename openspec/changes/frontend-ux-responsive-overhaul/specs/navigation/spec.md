# Delta for navigation

## ADDED Requirements

### Requirement: Profile Dropdown i18n

The system SHALL replace all hardcoded English strings in the profile dropdown with `translate` pipe references for "Profile", "Settings", "Signing out...", and "Sign out".

#### Scenario: Profile menu item is translated

- GIVEN the profile dropdown renders in Spanish
- WHEN the dropdown menu items are displayed
- THEN "Profile" appears as "Perfil" (or equivalent translation)

#### Scenario: Settings menu item is translated

- GIVEN the profile dropdown renders in French
- WHEN the dropdown menu items are displayed
- THEN "Settings" appears as "Paramètres" (or equivalent translation)

#### Scenario: Sign out states are translated

- GIVEN the profile dropdown renders
- WHEN the sign out action is triggered
- THEN "Signing out..." and "Sign out" display in the current locale language

### Requirement: Responsive Avatar Sizing

The system SHALL render the profile dropdown avatar at a maximum of 48px on mobile viewports and 64px on desktop viewports.

#### Scenario: Avatar is 48px on mobile

- GIVEN viewport is below 768px
- WHEN the profile dropdown renders
- THEN the avatar image is at most 48x48px

#### Scenario: Avatar is 64px on desktop

- GIVEN viewport is 768px or above
- WHEN the profile dropdown renders
- THEN the avatar image is at most 64x64px

#### Scenario: Avatar does not overflow dropdown

- GIVEN any viewport size
- WHEN the profile dropdown opens
- THEN the avatar fits within the dropdown boundaries without causing overflow
