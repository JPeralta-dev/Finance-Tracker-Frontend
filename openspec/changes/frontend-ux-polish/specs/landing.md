# Spec: Landing Footer Visual Distinction

## Domain: landing

### Requirement: Footer MUST have visually distinct appearance from page content

The landing page footer SHALL be visually separated from the content above it through distinct background color and visible top border.

#### Scenario: Footer background differs from page background

- GIVEN the landing page is rendered
- WHEN the user scrolls to the footer
- THEN the footer background color SHALL differ from the page content background (`--bg-primary`)
- AND the footer SHALL use `--bg-secondary` from the design system

#### Scenario: Footer has visible top border

- GIVEN the landing page is rendered
- WHEN the user scrolls to the footer
- THEN a top border SHALL separate the footer from the content above
- AND the border SHALL be at least 1px solid with visible color

#### Scenario: Footer spans full viewport width

- GIVEN the landing page is rendered at 1440px viewport width
- WHEN the footer is displayed
- THEN the footer background SHALL extend to both edges of the viewport
- AND footer content SHALL remain centered within the `--content-max-width` container

#### Scenario: Footer content remains constrained

- GIVEN the footer spans full viewport width
- WHEN footer content (links, brand, status) is rendered
- THEN the content SHALL be contained within a `max-width` container
- AND SHALL be centered horizontally
