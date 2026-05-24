# Navigation Specification

## Purpose

Defines topbar title behavior to eliminate duplicate titles when a route matches a nav item.

## Requirements

### Requirement: Hide pageTitle on Matching Nav Items

The system SHALL hide the pageTitle in the topbar when the current route matches an existing navigation item.

#### Scenario: Dashboard route hides title

- GIVEN user navigates to `/dashboard`
- WHEN the topbar renders
- THEN pageTitle is hidden (nav item already shows "Dashboard")

#### Scenario: Transactions route hides title

- GIVEN user navigates to `/transactions`
- WHEN the topbar renders
- THEN pageTitle is hidden

### Requirement: Show pageTitle for Sub-Routes

The system SHALL display pageTitle only for sub-routes that do not have a direct nav item: settings, profile, transaction form.

#### Scenario: Settings route shows title

- GIVEN user navigates to `/settings`
- WHEN the topbar renders
- THEN pageTitle displays "Settings"

#### Scenario: Profile route shows title

- GIVEN user navigates to `/profile`
- WHEN the topbar renders
- THEN pageTitle displays "Profile"

#### Scenario: Transaction form shows title

- GIVEN user navigates to `/transactions/new`
- WHEN the topbar renders
- THEN pageTitle displays the form title (e.g., "New Transaction")

### Requirement: No Duplicate Titles

The system SHALL never display the same text in both the nav item and the pageTitle simultaneously.

#### Scenario: No visual duplication

- GIVEN any route in the application
- WHEN the topbar and sidebar render
- THEN the same label does not appear in both nav and pageTitle

#### Scenario: Edge route with no nav match

- GIVEN user navigates to a route with no nav item and no pageTitle configured
- WHEN the topbar renders
- THEN a default or empty pageTitle is shown without duplication
