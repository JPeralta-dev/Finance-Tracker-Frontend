# User Insights Specification

## Purpose

Defines the profile insights panel with user statistics and account metrics.

## Requirements

### Requirement: Insights Data Fetching

The system SHALL fetch user insights from the finance service when the profile page loads.

#### Scenario: Insights load on profile visit

- GIVEN user is on the profile page
- WHEN the component initializes
- THEN financeService is called to retrieve user insights

#### Scenario: Error handling on fetch failure

- GIVEN the finance service returns an error
- WHEN insights are requested
- THEN a fallback message displays without crashing the page

### Requirement: Reusable Insights Panel

The system SHALL reuse `InsightsPanelComponent` from the dashboard, either by importing from shared or moving it to shared.

#### Scenario: Panel renders in profile context

- GIVEN insights data is available
- WHEN the profile page renders
- THEN InsightsPanelComponent displays with profile-appropriate styling

#### Scenario: Panel reuses dashboard logic

- GIVEN the component is shared
- WHEN both dashboard and profile use it
- THEN the same component renders with different data inputs

### Requirement: User Statistics Display

The system SHALL display account age, total transactions, and top spending category.

#### Scenario: All stats render with valid data

- GIVEN user has transaction history
- WHEN the insights panel loads
- THEN account age, total transaction count, and top category are visible

#### Scenario: New user with no transactions

- GIVEN user has zero transactions
- WHEN the insights panel loads
- THEN account age shows, transaction count shows 0, top category shows "N/A"

### Requirement: Currency-Aware Values

The system SHALL format any monetary values in insights using the CurrencyService.

#### Scenario: Monetary stats use configured currency

- GIVEN CurrencyService is set to a non-USD currency
- WHEN insights with monetary values render
- THEN amounts use the correct symbol and locale
