# Delta for analytics

## ADDED Requirements

### Requirement: Responsive Charts

The system SHALL render analytics charts (AreaChart, DonutChart) that resize to fit their container at all breakpoints without overflow or clipped content.

#### Scenario: Area chart resizes on mobile

- GIVEN viewport is below 768px
- WHEN the analytics area chart renders
- THEN the chart fits within its container without horizontal overflow

#### Scenario: Donut chart resizes on mobile

- GIVEN viewport is below 768px
- WHEN the analytics donut chart renders
- THEN the chart fits within its container without clipping

#### Scenario: Charts resize on viewport change

- GIVEN the analytics page is displayed at desktop width
- WHEN the viewport is resized to 320px
- THEN all charts resize proportionally without overflow

### Requirement: Responsive Financial Breakdown Sections

The system SHALL stack the three analytics sections (monthly trends, category breakdown, income vs expense) vertically on mobile and in a grid layout on desktop.

#### Scenario: Sections stack on mobile

- GIVEN viewport is below 768px
- WHEN the analytics page renders
- THEN the three sections stack in a single column

#### Scenario: Sections grid on desktop

- GIVEN viewport is 768px or above
- WHEN the analytics page renders
- THEN the sections display in a responsive grid layout

### Requirement: Chart Tooltips Fit Mobile Viewport

The system SHALL ensure chart tooltips and labels remain visible and readable at all breakpoints without extending beyond the viewport.

#### Scenario: Tooltip fits on 320px viewport

- GIVEN viewport is 320px
- WHEN a user hovers/taps a chart data point
- THEN the tooltip renders within the viewport bounds

#### Scenario: Labels do not overlap on small screens

- GIVEN viewport is below 768px
- WHEN chart labels render
- THEN labels do not overlap each other or chart elements
