# Transaction Modal Specification

## Purpose

Convert the transaction form from a full page route (`/transactions/new`) to a modal launched from the transactions list, preserving the route as a fallback for deep-linking.

## Requirements

### Requirement: Modal Trigger Integration

The system SHALL provide trigger elements in the transactions list that open the form modal via Blendy animation, while keeping the page route as fallback.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| New button opens modal | User on transactions list | "New transaction" clicked | Modal opens with Blendy; button has `data-blendy-from` |
| Empty state CTA opens modal | Transaction list empty | "Add first transaction" clicked | Modal opens with Blendy animation |
| Route fallback preserved | User navigates to `/transactions/new` | Route loads | Form renders as full page (not modal); deep-link works |

### Requirement: Form Content Projection

The system SHALL project the transaction form into `FtBlendyModalComponent` preserving all existing logic (ReactiveForms, validation, edit mode).

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Form inside modal | Modal open | Content renders | Form projected via `ng-content`; all fields visible |
| Validation works | Modal open, empty form | Submit clicked | Errors display; form does not submit |
| Edit mode | User opens modal to edit | Modal loads | Form pre-populated; title shows "Edit transaction" |

### Requirement: Data Flow and Submission

The system SHALL handle form submission within the modal, close on success, and refresh the transaction list.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Success closes modal | Valid form data | Submit clicked | Transaction created/updated; modal closes with animation; list refreshes |
| Error stays open | Valid form data | Server returns error | Error banner displays; modal stays open; user may retry |
| Cancel closes modal | Modal open | Cancel clicked | Modal closes with animation; no data submitted |

### Requirement: Unsaved Changes Warning

The system SHALL warn before closing if the form has unsaved changes.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Dirty form warning | Form fields modified | Close attempted (backdrop/escape/cancel) | Confirmation dialog shown; confirm closes without save; cancel keeps modal open |
| Clean form closes | Form pristine | Close attempted | Modal closes immediately, no confirmation |

### Requirement: Concurrent Modal Prevention

The system SHALL prevent multiple transaction modals from opening simultaneously.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Second open ignored | Modal already open | "New transaction" clicked again | No second modal opens; existing modal stays in focus |
