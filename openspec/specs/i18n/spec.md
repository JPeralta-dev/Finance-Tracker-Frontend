# i18n Specification

## Purpose

Defines the globe icon language dropdown that replaces text-based language buttons.

## Requirements

### Requirement: Globe Icon Trigger in Public Navbar

The system SHALL display a globe icon button in the public navbar as the language selector trigger.

#### Scenario: Globe icon renders in navbar

- GIVEN user views the public navbar
- WHEN the navbar renders
- THEN a globe icon button is visible

#### Scenario: Text language buttons are removed

- GIVEN the previous implementation had text buttons (ES/EN/FR)
- WHEN the new navbar renders
- THEN no text-only language buttons are visible

### Requirement: Dropdown with Language Options

The system SHALL show a dropdown on globe click with ES, EN, and FR options, each with a country flag.

#### Scenario: Dropdown opens on click

- GIVEN user clicks the globe icon
- WHEN the click event fires
- THEN a dropdown appears with ES, EN, FR options and flags

#### Scenario: Language selection applies change

- GIVEN the dropdown is open
- WHEN user clicks "EN"
- THEN the application language switches to English
- AND the dropdown closes

### Requirement: Click-Outside Closes Dropdown

The system SHALL close the language dropdown when the user clicks outside of it.

#### Scenario: Outside click closes dropdown

- GIVEN the language dropdown is open
- WHEN user clicks anywhere outside the dropdown
- THEN the dropdown closes

#### Scenario: Inside click does not close

- GIVEN the language dropdown is open
- WHEN user clicks a language option inside the dropdown
- THEN the dropdown closes after selection is applied

### Requirement: Mobile Compact Trigger

The system SHALL render the same dropdown on mobile with a compact trigger that fits the reduced navbar.

#### Scenario: Mobile dropdown works

- GIVEN viewport is below 768px
- WHEN user taps the globe icon
- THEN the dropdown appears with language options

#### Scenario: Mobile dropdown closes on selection

- GIVEN mobile dropdown is open
- WHEN user selects a language
- THEN the language changes and dropdown closes
