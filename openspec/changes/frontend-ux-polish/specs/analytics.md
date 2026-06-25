# Delta: Analytics UX Fixes

## Domain: analytics

### Requirement: KPI grid MUST fill full horizontal width

The analytics KPI cards grid SHALL use fixed column counts at each breakpoint instead of `auto-fill` to prevent unused white space.

#### Scenario: Desktop layout — 4 equal columns

- GIVEN the viewport width is 1024px or greater
- AND 4 KPI cards are displayed
- WHEN the analytics page renders
- THEN the KPI grid SHALL display 4 equal-width columns
- AND no white space gaps SHALL remain on the right side

#### Scenario: Tablet layout — 2 equal columns

- GIVEN the viewport width is between 768px and 1023px
- AND 4 KPI cards are displayed
- WHEN the analytics page renders
- THEN the KPI grid SHALL display 2 columns
- AND cards SHALL wrap to a second row

#### Scenario: Mobile layout — 1 full-width column

- GIVEN the viewport width is less than 768px
- WHEN the analytics page renders
- THEN each KPI card SHALL span the full container width

---

### Requirement: Chart tooltips MUST render inside the chart container

ECharts tooltips in all chart types SHALL be confined to their container element. Tooltips at chart edges (leftmost/rightmost bars) MUST remain fully visible.

#### Scenario: Left edge bar tooltip

- GIVEN the daily spending chart has data for Monday (leftmost bar)
- WHEN the user hovers over the Monday bar
- THEN the tooltip SHALL render entirely inside the chart container
- AND no part of the tooltip SHALL be clipped by `overflow: hidden`

#### Scenario: Right edge bar tooltip

- GIVEN the daily spending chart has data for Sunday (rightmost bar)
- WHEN the user hovers over the Sunday bar
- THEN the tooltip SHALL render entirely inside the chart container
- AND no part of the tooltip SHALL be clipped

#### Scenario: Middle bar tooltip — normal behavior

- GIVEN the user hovers over a middle bar (e.g., Wednesday)
- WHEN the tooltip appears
- THEN the tooltip SHALL display at its normal position
- AND the `confine` option SHALL NOT alter its behavior for non-edge bars

#### Scenario: Area chart tooltips also confined

- GIVEN the monthly trends area chart is displayed
- WHEN the user hovers near the left or right edge of the chart
- THEN the tooltip SHALL render inside the container

#### Scenario: Donut chart tooltips also confined

- GIVEN the category breakdown donut chart is displayed
- WHEN the user hovers over a segment near the chart edge
- THEN the tooltip SHALL render inside the container

---

### Requirement: Daily chart xAxis labels MUST use the active locale

The daily spending bar chart SHALL display day name abbreviations in the user's active language via the `TranslationService`.

#### Scenario: Spanish locale — abbreviated Spanish day names

- GIVEN the active language is Spanish (es)
- AND daily spending data exists
- WHEN the daily chart renders
- THEN the xAxis labels SHALL display "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"

#### Scenario: English locale — English day abbreviations

- GIVEN the active language is English (en)
- AND daily spending data exists
- WHEN the daily chart renders
- THEN the xAxis labels SHALL display "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"

#### Scenario: French locale — French day abbreviations

- GIVEN the active language is French (fr)
- AND daily spending data exists
- WHEN the daily chart renders
- THEN the xAxis labels SHALL display "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"
