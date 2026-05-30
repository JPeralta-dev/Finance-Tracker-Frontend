# Analytics Specification

## Purpose

Defines the analytics page with charts, spending trends, and financial breakdowns.

## Requirements

### Requirement: Lazy-Loaded Analytics Route

The system SHALL expose the analytics page at `/analytics` as a lazy-loaded route.

#### Scenario: Route loads on demand

- GIVEN user is authenticated on the dashboard
- WHEN user navigates to `/analytics`
- THEN the analytics module loads asynchronously
- AND the page renders within 2s on a standard connection

#### Scenario: Unauthenticated access

- GIVEN user has no valid token
- WHEN user navigates to `/analytics`
- THEN the auth guard redirects to `/login`

### Requirement: Chart Reuse from Shared Library

The system SHALL reuse `AreaChart` and `DonutChart` components from the shared library.

#### Scenario: Area chart renders monthly trends

- GIVEN analytics data is available
- WHEN the area chart component initializes
- THEN it displays monthly spending trends with correct labels

#### Scenario: Donut chart renders category breakdown

- GIVEN category data exists for the period
- WHEN the donut chart component initializes
- THEN it displays category proportions with percentage labels

### Requirement: Financial Breakdown Sections

The system SHALL display three sections: monthly trends, category breakdown, and income vs expense.

#### Scenario: All sections render with data

- GIVEN the user has transaction history
- WHEN the analytics page loads
- THEN monthly trends, category breakdown, and income vs expense sections are visible

#### Scenario: Empty state with no transactions

- GIVEN the user has zero transactions
- WHEN the analytics page loads
- THEN each section displays a "No data available" placeholder

### Requirement: Currency-Aware Formatting

The system SHALL format all monetary values using the centralized CurrencyService.

#### Scenario: Values use configured currency

- GIVEN CurrencyService is set to EUR
- WHEN analytics values render
- THEN all amounts display with the EUR symbol and locale formatting

#### Scenario: Chart tooltips use currency service

- GIVEN a user hovers over a chart data point
- WHEN the tooltip renders
- THEN the monetary value uses the CurrencyService formatter
