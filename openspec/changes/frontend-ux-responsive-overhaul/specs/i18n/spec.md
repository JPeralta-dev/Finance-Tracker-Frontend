# Delta for i18n

## ADDED Requirements

### Requirement: Locale File Synchronization

The system SHALL maintain synchronized translation keys across all locale files (en.json, es.json, fr.json) with no more than 2% key count variance.

#### Scenario: fr.json has analytics section

- GIVEN the fr.json locale file
- WHEN the file is validated against en.json
- THEN all keys under the `analytics` namespace exist in fr.json with French translations

#### Scenario: fr.json has profile keys

- GIVEN the fr.json locale file
- WHEN the file is validated against en.json
- THEN all keys under the `profile` namespace (including `profile.insights`, `profile.accountAge`, `profile.totalTransactions`) exist in fr.json

#### Scenario: Key count within tolerance

- GIVEN all three locale files
- WHEN key counts are compared
- THEN the variance between any two files is within 2%

### Requirement: No Technical Keys Visible to Users

The system SHALL display translated text for all user-facing strings — no raw translation keys (e.g., `profile.insights`) shall be visible in the UI.

#### Scenario: Profile page shows translated text

- GIVEN the profile page renders in any supported language
- WHEN all text content is inspected
- THEN no raw i18n keys are visible — all strings are translated

#### Scenario: Profile dropdown shows translated text

- GIVEN the profile dropdown renders in any supported language
- WHEN all text content is inspected
- THEN "Profile", "Settings", "Signing out...", and "Sign out" are translated, not raw keys

### Requirement: Hardcoded English Strings Replaced

The system SHALL replace all hardcoded English strings in the profile page (~20 strings) and profile dropdown (4 strings) with `translate` pipe references.

#### Scenario: Profile page uses translate pipe

- GIVEN the profile page template
- WHEN all text strings are audited
- THEN zero hardcoded English strings exist — all use the `| translate` pipe

#### Scenario: Profile dropdown uses translate pipe

- GIVEN the profile dropdown template
- WHEN all text strings are audited
- THEN "Profile", "Settings", "Signing out...", and "Sign out" use the `| translate` pipe
