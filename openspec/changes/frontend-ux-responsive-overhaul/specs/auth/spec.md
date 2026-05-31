# Delta for auth

## ADDED Requirements

### Requirement: Telegram Linking Uses Environment Variable

The system SHALL use `environment.telegramBotUrl` for the Telegram bot deep link instead of any hardcoded username value.

#### Scenario: Deep link uses environment variable

- GIVEN the settings page Telegram linking section renders
- WHEN the Telegram bot link is generated
- THEN the URL is constructed from `environment.telegramBotUrl`, not a hardcoded string

#### Scenario: Auto-send button is visible

- GIVEN the `.btn-telegram-auto` SCSS class exists
- WHEN the Telegram auto-send button renders
- THEN it has visible styles (not invisible/hidden)

### Requirement: Already-Linked State Display

The system SHALL display an "Account linked" state with a disabled/blocked button when the user's Telegram account is already linked.

#### Scenario: Linked account shows blocked state

- GIVEN the user's Telegram account is already linked (backend returns `linked: true`)
- WHEN the settings page loads
- THEN the Telegram link button is disabled and shows "Account linked" text

#### Scenario: Unlinked account shows active button

- GIVEN the user's Telegram account is not linked
- WHEN the settings page loads
- THEN the Telegram link button is enabled and clickable

### Requirement: Duplicate Linking Prevention

The system SHALL prevent duplicate Telegram linking attempts via a frontend guard that checks link status before allowing the linking flow.

#### Scenario: Frontend guard blocks duplicate link

- GIVEN the user is already linked to Telegram
- WHEN the user attempts to initiate the linking flow
- THEN the frontend blocks the action and shows the already-linked state

#### Scenario: Backend validation rejects duplicate

- GIVEN a duplicate linking request is sent
- WHEN the backend processes the request
- THEN it returns an error indicating the account is already linked

### Requirement: Telegram Linking Loading States

The system SHALL display loading, success, error, and already-linked states during the Telegram linking flow.

#### Scenario: Loading state displays during link attempt

- GIVEN user initiates Telegram linking
- WHEN the linking request is in progress
- THEN a loading indicator is shown and the button is disabled

#### Scenario: Error state displays on failure

- GIVEN the Telegram linking request fails
- WHEN the error response is received
- THEN an error message is displayed and the button returns to enabled state

#### Scenario: Success state displays on completion

- GIVEN the Telegram linking succeeds
- WHEN the success response is received
- THEN a success message is shown and the state transitions to "Account linked"
