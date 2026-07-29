# Delta for i18n

## ADDED Requirements

### Requirement: Profile Section Translation Keys

The system SHALL include `settings.profile.title`, `settings.profile.display_name`, and `settings.profile.email` in all locale files.

#### Scenario: English keys present

- GIVEN the application locale is English
- WHEN `TranslatePipe` resolves `settings.profile.title`
- THEN the value "Profile" is displayed
- AND `settings.profile.display_name` resolves to "Display name"
- AND `settings.profile.email` resolves to "Email"

#### Scenario: Spanish keys present

- GIVEN the application locale is Spanish
- WHEN `TranslatePipe` resolves `settings.profile.title`
- THEN the value "Perfil" is displayed
- AND `settings.profile.display_name` resolves to "Nombre visible"
- AND `settings.profile.email` resolves to "Correo"

#### Scenario: French keys present

- GIVEN the application locale is French
- WHEN `TranslatePipe` resolves `settings.profile.title`
- THEN the value "Profil" is displayed
- AND `settings.profile.display_name` resolves to "Nom affiché"
- AND `settings.profile.email` resolves to "E-mail"

### Requirement: Drawer Accessibility Label

The gear icon button SHALL bind `[attr.aria-label]` to the existing translation key `settings.preferences.title`.

#### Scenario: Screen reader announces gear button

- GIVEN the Settings page header is rendered
- WHEN a screen reader encounters the gear icon button
- THEN it announces the translated value of `settings.preferences.title`
- AND the accessible name is present in all 3 locales

#### Scenario: ARIA label matches locale switch

- GIVEN user switches from English to Spanish
- WHEN the page re-renders with Spanish translations
- THEN the gear icon's `aria-label` updates to the Spanish "Preferencias"
