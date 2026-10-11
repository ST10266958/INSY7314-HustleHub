# Frontend validation — 11 October 2026

## Scope

Frontend files only. Backend functionality, authentication policy, database records, credentials and CSP configuration were not changed. The pending local merge and its staged files were left untouched. No Git staging, commit or push was performed.

## Forms

Shared rules are in `src/validation.js`. Login and registration have visible field-specific errors, an accessible summary, aria-invalid/aria-describedby, focus on the first invalid field, and disabled controls during submission. Invalid values never reach the authentication API.

- Email: required, trimmed, basic email format, maximum 254 characters. This is format validation, not verification that an email address exists. Backend validation remains authoritative.
- Login password: required (not whitespace only), maximum 128 characters; existing passwords are not required to pass the stricter registration strength rule. Passwords are never trimmed or normalized before sending.
- Registration password: 8–128 characters with uppercase, lowercase and a digit, aligned with the current backend rules.
- Registration roles: Client or Freelancer only. Admin self-registration was not enabled.
- Gig title: required after trimming, maximum 120 characters.
- Description: required after trimming, maximum 2000 characters.
- Category: optional, trimmed, maximum 50 characters.
- Price: required, finite, non-negative decimal amount with at most two decimal places. Empty input is not treated as zero; exponent notation and unsafe-size cent values are rejected. Zero remains allowed by the backend contract.

Text remains safely rendered by React; validation does not strip legitimate characters or claim to replace backend sanitization. No password-confirmation requirement or new backend fields were introduced.

## Actions and read-only pages

- Gig detail routes reject malformed MongoDB IDs without an API request.
- Booking handlers check service presence, signed-in client role, availability and self-booking restrictions, and block duplicate clicks while pending or after a result.
- Incomplete booking confirmation directs the user to My bookings and disables another booking attempt until the result is checked; it does not falsely report successful payment or assume the operation failed.
- Editing/deleting validates the selected gig ID before requests; deletion still requires separate confirmation.
- Browse search is trimmed for matching and capped at 200 characters.
- Gig/booking collections and income summaries are checked for expected shapes and numeric values. Invalid API data shows a readable error instead of a rendering crash. Empty arrays remain valid.
- Booking-list errors can be retried. Existing route guards and readable API errors remain.
- Login 401 now says "Invalid email or password." Protected-route 401 retains expired-session guidance. Duplicate registration gets sign-in guidance. Raw server details are not displayed.

## Verification

81 tests passed across nine suites with zero failures. Regression coverage includes required/format/length checks, whitespace-only text, price boundaries, registration roles, invalid IDs, inaccessible booking actions, malformed page data, retry recovery and authentication error messages, as well as existing rendering, footer, API and CSP tests.

Production build passed: 41 modules transformed. The build used `npm run build -- --configLoader native` to avoid the known sandbox configuration-bundling permission issue. Tests/build ran on a frontend-only copy in the session validation workspace with its installed dependencies; results were copied into `docs/evidence/validation-*`. No live accounts, gigs, bookings or transactions were created during validation. Authenticated end-to-end MongoDB flows and mobile-browser interactions are not claimed as verified by these mocked tests.

## Review locally

Keep the backend and frontend dev servers running. Test empty/invalid login, weak registration passwords, whitespace-only gig title/description, negative or excessive-decimal prices, and normal valid input using dedicated test accounts. Refresh the browser if hot reload has not applied the changes. Do not commit `.env`, certificates/private keys or the old JSON account data.
