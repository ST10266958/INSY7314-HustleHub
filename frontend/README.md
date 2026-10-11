# HustleHub+ — Mel's Part 2 frontend

React + React Router + Vite, with Jest and React Testing Library. This folder contains Mel's work only; no backend files, Postman collections, shared root README, deployment or Part 3 features were changed.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 also works).

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Vite uses strict port 5173 so it cannot silently change the port and break CORS.

The API defaults to `https://localhost:5000/api`. To override it, copy `.env.example` to `.env` and change `VITE_API_URL`. Never put secrets in Vite variables: they are public client configuration. Restart Vite after changing the environment file.

The backend's `CLIENT_ORIGIN` must match `http://127.0.0.1:5173`. Trust the backend's local HTTPS certificate in your browser; do not disable TLS verification. Run the backend separately using its existing instructions.

## Included pages

- Public gig browsing with local text search and details.
- Registration as a client or freelancer, login and logout.
- Client booking flow with returned booking and transaction references, simulated payment notice, and own booking history.
- Freelancer dashboard: create, edit, activate/deactivate and delete own gigs with deletion confirmation; own bookings and API income summary.
- Anonymous and wrong-role route protection; loading, empty and readable error states.
- Responsive layout, labelled form controls and keyboard focus indicators.

## Security choices

JWT is held in React memory only and attached as a Bearer token for API requests. Refreshing the page ends the frontend session and requires sign-in. Passwords and tokens are not saved to browser storage or logged. Sign-out clears the frontend session; the backend has no revocation/logout endpoint in this contract.

Registration validates the backend's password rules. Gig fields use matching required/length/non-negative price constraints. React escapes text; the UI does not inject user HTML. Server errors are mapped to readable messages so stack traces, database details and response dumps cannot appear in the UI. Protected API 401 responses clear the current session. Frontend guards are for usability only; server-side JWT/RBAC/ownership checks remain essential and are Gia/Andisa's responsibility.

## Tests and build

```powershell
npm test
npm run test:coverage
npm run build
```

See `docs/part2-frontend-testing.md` and `docs/evidence/` for the actual recorded results and limitations. Mocked tests are not proof of a live MongoDB/backend integration.

## Scope boundaries

No fabricated transaction-list endpoint, admin provisioning, tax calculator, real payment gateway, Docker or CI/CD was added. The supplied API offers a booking-associated transaction in the creation response but no standalone transaction history endpoint. Tax and wider admin functionality appear in the overall project requirements, not Mel's assigned Part 2 API contract; confirm these with the team for the appropriate part. Shared README, demonstration video and final university-repository mirroring remain end-of-team tasks.

## Frontend Content Security Policy

Vite development and production-preview document responses now carry separate CSP policies. Restart the dev server after this change. See [CSP configuration, verification and deployment limitations](docs/frontend-csp.md). Static production hosting must emit the strict response headers itself; the headers are not embedded in the build output.