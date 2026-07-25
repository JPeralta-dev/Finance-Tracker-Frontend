# Landing Specification

## Purpose

Defines the landing page experience including responsive navbar, pricing display, social proof, FAQ, trust signals, legal pages, SEO, and call-to-action conversion elements.

## Requirements

### Requirement: Mobile Navbar Collapse

The system SHALL collapse secondary actions in the navbar when viewport is below 768px.

#### Scenario: Navbar collapses on mobile

- GIVEN viewport width is below 768px
- WHEN the landing page navbar renders
- THEN secondary actions are hidden behind a collapsible menu

#### Scenario: Desktop navbar unchanged

- GIVEN viewport width is 768px or above
- WHEN the landing page navbar renders
- THEN all actions are visible without collapse

### Requirement: Language Dropdown on Mobile

The system SHALL ensure the language dropdown works correctly on mobile viewports.

#### Scenario: Mobile dropdown is accessible

- GIVEN viewport is below 768px
- WHEN user taps the language trigger
- THEN the dropdown opens with language options

#### Scenario: Dropdown fits mobile screen

- GIVEN mobile dropdown is open
- WHEN the options render
- THEN all options are visible without horizontal scrolling

### Requirement: CTA Button Remains Visible

The system SHALL keep the primary CTA button visible at all viewport sizes.

#### Scenario: CTA visible on mobile

- GIVEN viewport is below 768px
- WHEN the navbar renders
- THEN the CTA button is visible and tappable

#### Scenario: Sign In becomes icon-only on mobile

- GIVEN viewport is below 768px
- WHEN the navbar renders
- THEN the "Sign In" text is replaced with a user icon

### Requirement: Collapsible Menu Toggle

The system SHALL provide a toggle mechanism to show/hide collapsed secondary actions on mobile.

#### Scenario: Toggle opens collapsed menu

- GIVEN viewport is below 768px and menu is collapsed
- WHEN user taps the menu toggle
- THEN secondary actions expand

#### Scenario: Toggle closes expanded menu

- GIVEN mobile menu is expanded
- WHEN user taps the toggle again or outside
- THEN secondary actions collapse

### Requirement: Pricing Tier Display

The system SHALL render three pricing tier cards (Free, Premium, Premium Plus) in a responsive grid within the landing page. Each card MUST display: tier name, price, billing period, feature list, and a CTA button. Pricing data MUST be sourced from `shared/models/tier.model.ts` — the same model used by the subscription page.

#### Scenario: Desktop renders three-column grid

- GIVEN viewport width ≥ 1024px
- WHEN the pricing section renders
- THEN three tier cards display in a horizontal row with equal width

#### Scenario: Mobile stacks cards vertically

- GIVEN viewport width < 768px
- WHEN the pricing section renders
- THEN cards stack in a single column, full width

#### Scenario: Pricing data matches subscription page

- GIVEN the shared Tier model defines 3 tiers
- WHEN the landing pricing section renders
- THEN displayed prices, features, and names match the subscription page exactly

### Requirement: Plan Comparison Table

The system SHALL render a feature comparison table (Free vs Premium) below the tier cards. Rows MUST represent features; columns MUST represent tiers. Cells MUST use check/cross icons to indicate availability.

#### Scenario: Comparison table renders on desktop

- GIVEN viewport width ≥ 768px
- WHEN the user scrolls to the comparison section
- THEN a table displays with feature rows and tier columns with icons

#### Scenario: Comparison table scrolls horizontally on mobile

- GIVEN viewport width < 768px
- WHEN the comparison table renders
- THEN the table is horizontally scrollable without breaking layout

### Requirement: Testimonials Carousel

The system SHALL render a testimonials section with placeholder social proof content. The component MUST accept an array of testimonial objects (name, role, text, avatar placeholder) via `@Input()`. Content MUST be swappable — replacing the input array MUST update the display without code changes.

#### Scenario: Placeholder testimonials render

- GIVEN the component receives an array of 3 placeholder testimonials
- WHEN the section renders
- THEN each testimonial displays name, role, text, and avatar placeholder

#### Scenario: Empty testimonials array

- GIVEN the component receives an empty array
- WHEN the section renders
- THEN the section is hidden (no empty state shown)

### Requirement: FAQ Accordion

The system SHALL render an accordion-style FAQ section. Each item MUST have a question (always visible) and an answer (toggleable). Only ONE item MAY be expanded at a time. Questions and answers MUST support i18n (Spanish + English).

#### Scenario: User expands a FAQ item

- GIVEN the FAQ section is rendered with 5 items
- WHEN user clicks a collapsed question
- THEN the answer expands with a smooth animation

#### Scenario: Opening one item closes others

- GIVEN FAQ item A is expanded
- WHEN user clicks question B
- THEN item A collapses and item B expands

#### Scenario: All items collapsed by default

- GIVEN the FAQ section renders
- WHEN the page loads
- THEN all items are collapsed

### Requirement: Trust Signal Badges

The system SHALL render a trust signals section displaying security/privacy badges. Each badge MUST include an icon and a short label (e.g., "256-bit encryption", "Your data stays on your device"). Badges MUST use the existing design system glass morphism style.

#### Scenario: Trust badges render in a row

- GIVEN viewport width ≥ 768px
- WHEN the trust signals section renders
- THEN badges display in a horizontal row, evenly spaced

#### Scenario: Trust badges stack on mobile

- GIVEN viewport width < 768px
- WHEN the trust signals section renders
- THEN badges wrap to a 2-column grid

### Requirement: Legal Pages

The system SHALL provide three legal pages accessible via routing: `/legal/terms`, `/legal/privacy`, `/legal/cookies`. Each page MUST render a "Coming soon" placeholder with the page title and a back link. Pages MUST be standalone components.

#### Scenario: User navigates to terms page

- GIVEN the user clicks the "Terms of Service" footer link
- WHEN the route resolves
- THEN the terms page renders with "Coming soon" placeholder and title

#### Scenario: Legal page has back navigation

- GIVEN the user is on any legal page
- WHEN they click the back link
- THEN they are navigated to the landing page

### Requirement: Footer Legal Links

The system SHALL replace all `href="#"` placeholder links in the footer with `routerLink` directives pointing to the legal pages. The footer MUST contain links to: Terms, Privacy, Cookies.

#### Scenario: Footer links navigate correctly

- GIVEN the footer renders on the landing page
- WHEN user clicks "Privacy Policy"
- THEN the browser navigates to `/legal/privacy`

### Requirement: Meta Tags

The system SHALL set the following meta tags on the landing page: `description`, `keywords`, `og:title`, `og:description`, `og:image`, `og:type`, `og:url`. Tags MUST be set via Angular's `Meta` service. Values MUST support i18n.

#### Scenario: OG tags present in HEAD

- GIVEN the landing page loads
- WHEN inspecting the `<head>` element
- THEN `og:title`, `og:description`, `og:image` meta tags are present with correct content

#### Scenario: OG image loads

- GIVEN the OG image path is `assets/og/og-image.svg`
- WHEN a social platform crawls the page
- THEN the image URL resolves to a valid 1200×630 SVG

### Requirement: Hero CTA Copy

The system SHALL display "Start your 30-day free trial" as the primary CTA text in the hero section and final CTA section, replacing the previous "Get Started" text. The CTA MUST remain visible at all viewport sizes (existing requirement preserved).

(Previously: CTA text was "Get Started" — now "Start your 30-day free trial")

#### Scenario: Hero CTA shows new copy

- GIVEN the landing page loads
- WHEN the hero section renders
- THEN the primary CTA button displays "Start your 30-day free trial"

#### Scenario: Final CTA shows new copy

- GIVEN the user scrolls to the final CTA section
- WHEN the section renders
- THEN the CTA button displays "Start your 30-day free trial"

#### Scenario: CTA visible on mobile (preserved)

- GIVEN viewport is below 768px
- WHEN the navbar renders
- THEN the CTA button is visible and tappable

### Requirement: Footer Links Replace Hash Placeholders

The system SHALL replace all `href="#"` links in the footer component with valid `routerLink` directives. Existing navbar behavior (collapse, language dropdown, toggle) is UNCHANGED.

(Previously: Footer links used `href="#"` dead links)

#### Scenario: No dead links in footer

- GIVEN the landing page footer renders
- WHEN inspecting all `<a>` elements
- THEN no anchor has `href="#"`
