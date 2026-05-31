# Delta for user-insights

## ADDED Requirements

### Requirement: Profile Page Card-Based Layout

The system SHALL display the profile page with a card-based layout where each section (avatar, personal info, insights, account actions) is in a separate card with consistent spacing and visual hierarchy.

#### Scenario: Profile sections are in separate cards

- GIVEN the profile page renders
- WHEN the layout is inspected
- THEN avatar, personal info, insights, and account actions each occupy their own card container

#### Scenario: Cards have consistent spacing

- GIVEN the profile page cards render
- WHEN spacing between cards is measured
- THEN a consistent gap (premium spacing) exists between all cards

### Requirement: Profile Page Translation

The system SHALL use translated keys for all text content on the profile page, including `profile.insights`, `profile.accountAge`, and `profile.totalTransactions`.

#### Scenario: Insights section uses translated keys

- GIVEN the profile page renders in any supported language
- WHEN the insights section displays
- THEN section titles and labels use translated keys, not raw key names

#### Scenario: Account age label is translated

- GIVEN the profile page renders in Spanish
- WHEN the account age metric displays
- THEN the label shows the Spanish translation, not "profile.accountAge"

### Requirement: Responsive Avatar Sizing

The system SHALL render the profile page avatar at a maximum of 48px on mobile and 64px on desktop, replacing the current oversized avatar.

#### Scenario: Avatar is 48px max on mobile

- GIVEN viewport is below 768px
- WHEN the profile page avatar renders
- THEN the avatar is at most 48x48px

#### Scenario: Avatar is 64px max on desktop

- GIVEN viewport is 768px or above
- WHEN the profile page avatar renders
- THEN the avatar is at most 64x64px

### Requirement: Modern Typography

The system SHALL use consistent typography scale for profile page headings, labels, and values aligned with the design system.

#### Scenario: Headings use design system font size

- GIVEN the profile page renders
- WHEN section headings are inspected
- THEN they use the design system heading scale, not arbitrary sizes

#### Scenario: Labels and values have visual distinction

- GIVEN a profile card with label-value pairs
- WHEN the card renders
- THEN labels use secondary text color (#4B5563) and values use title color (#2E1065)
