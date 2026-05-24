# Currency Specification

## Purpose

Defines a centralized CurrencyService that replaces hardcoded USD values across the application.

## Requirements

### Requirement: CurrencyService Configuration

The system SHALL provide a CurrencyService with configurable currency code, locale, symbol, and decimal places.

#### Scenario: Default USD configuration

- GIVEN no custom currency is set
- WHEN CurrencyService is injected
- THEN it returns USD with `$` symbol, `en-US` locale, and 2 decimals

#### Scenario: Custom currency configuration

- GIVEN user selects EUR as currency
- WHEN CurrencyService is queried
- THEN it returns EUR with `€` symbol, `de-DE` locale, and 2 decimals

### Requirement: All Components Use CurrencyService

The system SHALL replace all hardcoded USD references with CurrencyService calls in categories, stat-card, recent-activity, and transaction-row components.

#### Scenario: Stat card uses service

- GIVEN a stat card displays a monetary value
- WHEN the component renders
- THEN it formats the value via CurrencyService, not hardcoded USD

#### Scenario: Transaction row uses service

- GIVEN a transaction row shows an amount
- WHEN the component renders
- THEN the amount is formatted via CurrencyService

#### Scenario: Category list uses service

- GIVEN the categories feature displays budget amounts
- WHEN the component renders
- THEN all amounts use CurrencyService formatting

### Requirement: Chart Tooltips Use Currency Service

The system SHALL ensure Chart.js tooltips pick up currency formatting from CurrencyService.

#### Scenario: Tooltip displays correct currency

- GIVEN a chart renders with monetary data points
- WHEN user hovers over a data point
- THEN the tooltip value uses CurrencyService formatter

#### Scenario: Tooltip updates on currency change

- GIVEN a chart is visible with USD formatting
- WHEN user switches currency to EUR
- THEN tooltip values update to EUR formatting on next hover

### Requirement: Service is Injectable and Reactive

The system SHALL expose currency configuration as a reactive signal or observable.

#### Scenario: Components react to currency changes

- GIVEN a component subscribes to currency changes
- WHEN the user switches currency
- THEN the component re-renders with the new currency format
