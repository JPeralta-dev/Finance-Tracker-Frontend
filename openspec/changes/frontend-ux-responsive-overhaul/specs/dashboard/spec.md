# Delta for dashboard

## ADDED Requirements

### Requirement: Responsive Stat Cards

The system SHALL render stat cards that adapt to viewport size: single column at 320-375px, two columns at 390-767px, and full grid (4 columns) at 1024px+.

#### Scenario: Single column on smallest mobile

- GIVEN viewport is 320px
- WHEN stat cards render
- THEN cards stack in a single column

#### Scenario: Two columns on medium mobile

- GIVEN viewport is 390px
- WHEN stat cards render
- THEN cards display in a two-column grid

#### Scenario: Full grid on desktop

- GIVEN viewport is 1024px or above
- WHEN stat cards render
- THEN cards display in a four-column grid

### Requirement: Responsive Transactions Table

The system SHALL render the transactions table responsively: scrollable container on mobile with preserved column headers, full table on desktop.

#### Scenario: Table scrolls horizontally on mobile

- GIVEN viewport is below 768px
- WHEN the transactions table renders with many columns
- THEN the table container scrolls horizontally without breaking the page layout

#### Scenario: Table is full-width on desktop

- GIVEN viewport is 768px or above
- WHEN the transactions table renders
- THEN the table occupies the full container width without horizontal scroll

### Requirement: Responsive Graphs

The system SHALL render dashboard graphs (charts) that resize to fit their container at all breakpoints without overflow.

#### Scenario: Graphs resize on viewport change

- GIVEN a dashboard with charts is displayed
- WHEN the viewport is resized from desktop to mobile
- THEN the charts resize to fit the smaller container without overflow

#### Scenario: Graphs do not overflow on 320px

- GIVEN viewport is 320px
- WHEN dashboard charts render
- THEN all chart content fits within the viewport width
