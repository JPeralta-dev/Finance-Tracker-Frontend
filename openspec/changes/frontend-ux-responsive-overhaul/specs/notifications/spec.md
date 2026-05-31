# notifications Specification

## Purpose

Defines the real notification data model, service, and dropdown with read/dismiss states, replacing the current empty shell implementation.

## Requirements

### Requirement: Notification Data Model

The system SHALL define a `Notification` interface with fields: `id` (string), `title` (string), `message` (string), `type` ('info' | 'success' | 'warning' | 'error'), `read` (boolean), `createdAt` (Date), and `actionUrl` (string | null).

#### Scenario: Notification model is typed

- GIVEN the notification model file
- WHEN TypeScript compiles
- THEN the `Notification` interface has all required fields with correct types

#### Scenario: Notification type is restricted

- GIVEN a notification is created
- WHEN the `type` field is assigned
- THEN only 'info', 'success', 'warning', or 'error' are valid values

### Requirement: Notification Service

The system SHALL provide a `NotificationService` that manages notification state using Angular signals, with methods to fetch, mark as read, dismiss, and clear all notifications.

#### Scenario: Service exposes notifications signal

- GIVEN NotificationService is injected
- WHEN the `notifications` signal is read
- THEN it returns the current list of notifications

#### Scenario: Mark notification as read

- GIVEN a notification with `read: false`
- WHEN `markAsRead(id)` is called
- THEN that notification's `read` field becomes `true`

#### Scenario: Dismiss notification

- GIVEN a notification exists in the list
- WHEN `dismiss(id)` is called
- THEN the notification is removed from the list

#### Scenario: Clear all notifications

- GIVEN multiple notifications exist
- WHEN `clearAll()` is called
- THEN the notification list is empty

### Requirement: Notification Dropdown Display

The system SHALL display a dropdown from the notification bell icon showing the list of notifications, centered within the viewport, with adaptive width and no overflow.

#### Scenario: Dropdown opens on bell click

- GIVEN user is on any authenticated page
- WHEN user clicks the notification bell icon
- THEN the dropdown appears centered below the bell

#### Scenario: Dropdown shows unread count badge

- GIVEN there are unread notifications
- WHEN the bell icon renders
- THEN a badge with the unread count is visible on the bell

#### Scenario: No badge when all read

- GIVEN all notifications are marked as read
- WHEN the bell icon renders
- THEN no unread badge is visible

### Requirement: Dropdown Responsiveness

The system SHALL center the notification dropdown, adapt its width to viewport size, and prevent off-screen content at all breakpoints.

#### Scenario: Dropdown centers on desktop

- GIVEN viewport is 768px or above
- WHEN the notification dropdown opens
- THEN it is centered horizontally relative to the bell icon

#### Scenario: Dropdown fits mobile viewport

- GIVEN viewport is below 768px
- WHEN the notification dropdown opens
- THEN it occupies full width minus 12px margins and does not overflow

#### Scenario: Long notification messages wrap

- GIVEN a notification with a long message
- WHEN the dropdown renders on a 320px viewport
- THEN the message text wraps and does not cause horizontal overflow

### Requirement: Notification Item Interaction

The system SHALL allow users to mark individual notifications as read by clicking them, and dismiss notifications via a close button.

#### Scenario: Click marks as read

- GIVEN an unread notification in the dropdown
- WHEN user clicks the notification item
- THEN the notification is marked as read and the unread count decreases

#### Scenario: Dismiss button removes notification

- GIVEN a notification in the dropdown
- WHEN user clicks the close/dismiss button on that notification
- THEN the notification is removed from the list

#### Scenario: Empty state displays

- GIVEN the notification list is empty
- WHEN the dropdown opens
- THEN a "No notifications" message is displayed

### Requirement: Notification Type Styling

The system SHALL visually distinguish notification types using color-coded indicators: info (blue), success (teal #2DD4BF), warning (amber), error (red).

#### Scenario: Success notification has teal indicator

- GIVEN a notification with type 'success'
- WHEN it renders in the dropdown
- THEN it displays a teal (#2DD4BF) visual indicator

#### Scenario: Info notification has blue indicator

- GIVEN a notification with type 'info'
- WHEN it renders in the dropdown
- THEN it displays a blue visual indicator
