# Notifications Modal Specification

## Purpose

Convert the notifications dropdown panel into a Blendy-animated modal triggered from the bell icon in the header, preserving all existing notification management functionality.

## Requirements

### Requirement: Modal Trigger from Bell Icon

The system SHALL open the notifications modal when the user clicks the bell icon in the header, replacing the current dropdown pattern.

#### Scenario: Bell icon click opens modal

- GIVEN the user is on any page with the header visible
- WHEN the user clicks the bell icon
- THEN the notifications modal SHALL open with Blendy animation
- AND the bell icon SHALL have `data-blendy-from` attribute set

#### Scenario: Unread badge displays on bell icon

- GIVEN there are unread notifications
- WHEN the header renders
- THEN a badge with the unread count SHALL display on the bell icon
- AND the badge SHALL hide when unread count is zero

### Requirement: Notification List Inside Modal

The system SHALL display the full notification list inside the modal with the same content structure as the previous dropdown.

#### Scenario: Notifications render in modal

- GIVEN the notifications modal is open
- WHEN notifications exist
- THEN each notification SHALL display its title, message, and type indicator
- AND unread notifications SHALL have a visual distinction (e.g., bold, highlight)

#### Scenario: Empty state displays

- GIVEN the notifications modal is open
- WHEN there are no notifications
- THEN an empty state message SHALL display with a bell icon
- AND the message SHALL be localized via the i18n pipe

### Requirement: Read/Unread State Management

The system SHALL allow marking individual notifications as read and maintain accurate unread counts.

#### Scenario: Click notification marks as read

- GIVEN an unread notification is displayed in the modal
- WHEN the user clicks on the notification
- THEN the notification SHALL be marked as read via `NotificationService`
- AND the unread badge count SHALL decrement
- AND the notification's visual style SHALL update to read state

#### Scenario: Mark all as read

- GIVEN there are multiple unread notifications
- WHEN the user clicks "Mark all as read" (if provided)
- THEN all notifications SHALL be marked as read
- AND the unread badge SHALL disappear

### Requirement: Notification Dismissal

The system SHALL allow dismissing individual notifications from the modal.

#### Scenario: Dismiss single notification

- GIVEN a notification is displayed in the modal
- WHEN the user clicks the dismiss (X) button on a notification
- THEN the notification SHALL be removed via `NotificationService.dismiss()`
- AND the unread count SHALL update if the dismissed notification was unread
- AND the remaining notifications SHALL reflow in the list

### Requirement: Accessibility for Notifications Modal

The system SHALL provide screen reader announcements and keyboard navigation for the notifications modal.

#### Scenario: Screen reader announces notification count

- GIVEN the notifications modal opens
- WHEN the modal becomes visible
- THEN a live region SHALL announce the number of notifications (e.g., "3 notifications, 2 unread")

#### Scenario: Keyboard navigation through notifications

- GIVEN the notifications modal is open with multiple notifications
- WHEN the user presses Tab
- THEN focus SHALL move through each notification item
- AND the dismiss button for each notification SHALL be focusable
- AND pressing Escape SHALL close the modal

#### Scenario: ARIA attributes on notifications modal

- GIVEN the notifications modal is rendered
- THEN the dialog SHALL have `role="dialog"` and `aria-modal="true"`
- AND the modal title SHALL be linked via `aria-labelledby`
