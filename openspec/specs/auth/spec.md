# Auth Specification

## Purpose

Defines authentication guard behavior with token expiry validation and redirect logic.

## Requirements

### Requirement: Token Expiry Validation

The system SHALL validate token expiry in the auth guard via JWT decode or API validation.

#### Scenario: Valid token passes guard

- GIVEN user has a non-expired JWT token
- WHEN the auth guard evaluates a protected route
- THEN navigation proceeds to the requested route

#### Scenario: Expired token fails guard

- GIVEN user has an expired JWT token
- WHEN the auth guard evaluates a protected route
- THEN navigation is cancelled and user is redirected to `/login`

### Requirement: Expired Token Redirect to Login

The system SHALL redirect users with expired tokens to the login page, allowing access to public routes.

#### Scenario: Expired token redirects correctly

- GIVEN user has an expired token stored
- WHEN user navigates to any protected route
- THEN the user is redirected to `/login`
- AND the stored token is cleared

#### Scenario: No token allows public access

- GIVEN user has no token
- WHEN user navigates to a public route (e.g., `/landing`)
- THEN navigation proceeds normally

### Requirement: HTTP 401 Interceptor Clears Tokens

The system SHALL clear stored tokens when an HTTP 401 response is received.

#### Scenario: 401 response triggers cleanup

- GIVEN user makes an API request with an invalid token
- WHEN the server responds with HTTP 401
- THEN the interceptor clears all stored tokens
- AND the user is redirected to `/login`

#### Scenario: 401 on background request

- GIVEN a background API call returns 401
- WHEN the interceptor processes the response
- THEN tokens are cleared without disrupting the current view until next navigation

### Requirement: Redirect-If-Auth Guard

The system SHALL redirect authenticated users away from login/signup pages.

#### Scenario: Authenticated user visits login

- GIVEN user has a valid, non-expired token
- WHEN user navigates to `/login`
- THEN the redirect guard sends them to `/dashboard`

#### Scenario: Expired token on login page

- GIVEN user has an expired token
- WHEN user navigates to `/login`
- THEN the user stays on the login page (no redirect loop)
