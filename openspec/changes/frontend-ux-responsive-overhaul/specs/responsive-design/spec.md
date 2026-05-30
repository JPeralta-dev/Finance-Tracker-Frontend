# responsive-design Specification

## Purpose

Defines the mobile-first responsive system across all components with defined breakpoints, overflow prevention, and touch-friendly targets.

## Requirements

### Requirement: Breakpoint System

The system SHALL support mobile-first breakpoints at 320px, 375px, 390px, 430px, 768px, and 1024px+ via TailwindCSS custom screens and SCSS media queries.

#### Scenario: Breakpoints are configured in Tailwind

- GIVEN the TailwindCSS configuration file
- WHEN the build compiles
- THEN responsive utility classes exist for sm (320px), md (768px), lg (1024px) and custom breakpoints

#### Scenario: SCSS mixins use breakpoint tokens

- GIVEN a component SCSS file
- WHEN a media query is needed
- THEN the SCSS references breakpoint tokens from shared variables, not hardcoded pixel values

### Requirement: Horizontal Overflow Prevention

The system SHALL prevent horizontal overflow (horizontal scroll) on all pages at all defined breakpoints.

#### Scenario: No horizontal scroll at 320px

- GIVEN viewport width is 320px
- WHEN any page is rendered
- THEN no horizontal scrollbar appears and all content fits within the viewport

#### Scenario: No horizontal scroll at 768px

- GIVEN viewport width is 768px
- WHEN any page is rendered
- THEN no horizontal scrollbar appears and all content fits within the viewport

#### Scenario: No horizontal scroll at 1024px

- GIVEN viewport width is 1024px
- WHEN any page is rendered
- THEN no horizontal scrollbar appears and all content fits within the viewport

### Requirement: Touch-Friendly Targets

The system SHALL ensure all interactive elements (buttons, links, dropdown triggers, form inputs) have a minimum touch target size of 44x44px on viewports below 768px.

#### Scenario: Buttons meet minimum touch target

- GIVEN viewport is below 768px
- WHEN a button renders
- THEN its clickable area is at least 44x44px

#### Scenario: Dropdown triggers are tappable

- GIVEN viewport is below 768px
- WHEN a dropdown trigger (globe icon, notification bell, profile avatar) renders
- THEN its clickable area is at least 44x44px

#### Scenario: Desktop targets unchanged

- GIVEN viewport is 768px or above
- WHEN interactive elements render
- THEN they use standard sizing (no forced 44px minimum)

### Requirement: Text Truncation and Wrapping

The system SHALL truncate or wrap text that exceeds container width instead of causing overflow at any breakpoint.

#### Scenario: Long text truncates with ellipsis

- GIVEN a text container with fixed width at 320px viewport
- WHEN text content exceeds container width
- THEN text truncates with ellipsis (...) and does not overflow

#### Scenario: Labels wrap on mobile

- GIVEN a form label or card label at 375px viewport
- WHEN the label text is longer than the available width
- THEN the text wraps to a new line instead of overflowing

### Requirement: Responsive Container Padding

The system SHALL apply safe padding that adapts to viewport size: 12px at 320-430px, 16px at 768px, 24px at 1024px+.

#### Scenario: Mobile container has 12px padding

- GIVEN viewport is between 320px and 430px
- WHEN a page container renders
- THEN left and right padding is 12px

#### Scenario: Tablet container has 16px padding

- GIVEN viewport is 768px
- WHEN a page container renders
- THEN left and right padding is 16px

#### Scenario: Desktop container has 24px padding

- GIVEN viewport is 1024px or above
- WHEN a page container renders
- THEN left and right padding is 24px

### Requirement: Modal Responsiveness

The system SHALL render modals that fit within the viewport at all breakpoints, with full-width on mobile and centered on desktop.

#### Scenario: Modal is full-width on mobile

- GIVEN viewport is below 768px
- WHEN a modal opens
- THEN the modal occupies 100% width with 12px margin from screen edges

#### Scenario: Modal is centered on desktop

- GIVEN viewport is 768px or above
- WHEN a modal opens
- THEN the modal is centered with max-width constraint
