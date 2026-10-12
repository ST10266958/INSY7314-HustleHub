# Part 2 — Mel's frontend testing

## Scope and environment

Original run executed on 8 October 2026 using Node.js 24.15.0, Jest 29 and React Testing Library. Five suites containing 29 tests passed, with zero failed tests. API responses are mocked: these are frontend/component/integration-with-mocks tests, not live backend or MongoDB tests.

Because the Windows sandbox could not consistently access files under the OneDrive clone, the same frontend source was copied into a Strawberry session validation workspace. Dependencies were installed using the committed lockfile with `npm ci --offline`. No backend code, credentials or user data were copied. Execution evidence was copied back into this folder after validation.

## Recorded execution

- `npm run test:coverage -- --json --outputFile=docs/evidence/jest-results.json`: exit 0, 5/5 suites and 29/29 tests passed.
- Standard `npm run build`: blocked by a sandbox ancestor-directory permission error during Vite configuration bundling; not a JavaScript compilation failure.
- `npm run build -- --configLoader native`: exit 0, Vite 6.4.4 compiled 40 modules and emitted production assets successfully. The native configuration loader bypasses sandbox-blocked ancestor lookup and is supported by the installed Vite/Node version.

Evidence is in `evidence/frontend-tests.txt`, `evidence/jest-results.json`, `evidence/frontend-build.txt` (initial blocked attempt), and `evidence/frontend-build-native-loader.txt` (successful production build). Coverage was enabled, but this report does not claim complete application coverage or an unverified percentage.

## Update: current suite after the admin dashboard (12 October 2026)

The results above are Mel's original run and are kept as recorded. Since then the frontend validation, CSP and admin dashboard work was merged into `main`. A full run on the current `main` gave 10 suites and 90 tests, all passing, with zero failures. `npm run build` (`vite build`) also succeeded. Evidence: `evidence/frontend-tests-admin-update.txt`. API responses are still mocked in all of these tests.

New admin coverage (6 tests in `AdminDashboard.test.jsx`, 2 in `App.test.jsx`, 1 in `validation.test.js`):

| Tests | Expected | Actual |
| --- | --- | --- |
| Admin data loading | All four admin endpoints requested, summary and users shown | Passed |
| Admin tabs | Switching to Bookings and Transactions shows the right rows | Passed |
| Gig removal | Separate confirmation required, then the admin DELETE endpoint is called | Passed |
| Cancelled removal | No DELETE request is made | Passed |
| Admin API failure | Readable error, no data shown | Passed |
| Malformed admin data | Rejected with a readable error | Passed |
| Navigation | Admin sees an Admin link and no client or freelancer links; clients and freelancers do not see it | Passed |
| Validation | User and transaction data are checked before display | Passed |

The admin dashboard was also checked by hand in the browser against the live backend and MongoDB on 11 October 2026 (users, gigs, bookings and transactions tabs loaded real data). Screenshots of that check are not yet saved in `evidence/`. Wrong-role access to `/admin` is covered by the route guard tests, and server-side enforcement is tested in the Postman and Newman admin tests in `backend/docs/part2-testing.md`.

## Expected versus actual

| Tests | Expected | Actual |
| --- | --- | --- |
| Gig rendering | Title, description, price and correct detail link | Passed |
| Empty gigs | Readable empty state | Passed |
| Untrusted gig text | Rendered as escaped text, no injected image element | Passed |
| Anonymous route access | Redirect to login, hide protected content | Passed |
| Wrong-role route access | Show access restriction, hide dashboard content | Passed |
| Freelancer route access | Allow freelancer page | Passed |
| Deleted gig booking display | Handle missing populated gig gracefully | Passed |
| Login interaction | Correct credentials sent and correct role destination | Passed |
| Login failure | Readable alert, submit re-enabled | Passed |
| Registration validation | Reject weak passwords before API call | Passed |
| Freelancer registration | Correct role submitted, dashboard navigation | Passed |
| Pending authentication | Disabled submit button | Passed |
| API booking request | Bearer header, correct HTTP method/body, returned transaction | Passed |
| Public API access | No JWT required in request | Passed |
| API status errors | 400/401/403/404/429/500 mapped without raw server details | Passed |
| Network/unexpected response | Actionable error instead of response dump | Passed |
| Client booking interaction | Booking and transaction references shown, booking button removed after success | Passed |
| Freelancer booking restriction | No booking action | Passed |
| Anonymous booking | Sign-in link shown | Passed |
| Dashboard queries | Own gigs, freelancer bookings and income requested | Passed |
| Gig creation | Correct validated body submitted | Passed |
| Gig editing | Own ID, updated data and active state submitted | Passed |
| Gig deletion | Separate confirmation required before DELETE | Passed |

## Still required for live evidence

The local `mel-auth-security` backend is Part 1 only. The following require the team's existing Part 2 backend, configured MongoDB, trusted local HTTPS certificate and matching `CLIENT_ORIGIN`:

1. Register a dedicated test client and test freelancer; log in as each.
2. Freelancer creates/edits a gig; anonymous visitor browses it.
3. Client books it; verify actual booking and transaction references.
4. Check client booking history, freelancer bookings and correct income increase.
5. Validate wrong-role access, ownership enforcement, real JWT expiry/invalid tokens and 429 behaviour with Gia's API tests.
6. Capture live application screenshots and record the team demonstration flow.
7. Review layout on desktop and mobile in the user's browser.

No live booking, user creation or database mutation was performed by this work. No Newman/backend-security tests are claimed; those remain Gia's allocation. No screenshots of fabricated API data are presented as real integration evidence.
