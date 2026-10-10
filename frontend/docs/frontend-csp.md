# Frontend CSP — development and production

## Implementation

`csp.js` builds response headers for the HTML document. `vite.config.js` applies them to Vite's development server and production-build preview server. No backend functionality, Helmet policy, CORS, credentials, database records or permissions were changed.

`VITE_API_URL` determines the exact allowed HTTP(S) API origin (default `https://localhost:5000`). This must match the value used when building the client. No wildcard API access is granted. Credential-bearing URLs and non-HTTP(S) schemes are rejected.

Development defaults to port 5173. Optional `VITE_DEV_PORT` supports an alternate local test port, with the corresponding localhost/127.0.0.1/::1 WebSocket origins added to CSP. Using an alternate port also requires a matching backend CORS origin for real API calls; this change does not modify backend CORS. Restart Vite after changing configuration or .env.

## Development policy

- Same-origin resources by default.
- Scripts: self + unsafe-inline, solely to permit Vite's injected React Refresh preamble. No unsafe-eval.
- Styles: self + unsafe-inline, to permit Vite's injected CSS hot-reload style elements.
- Connections: self + configured API origin + explicit local development WebSocket origins.
- Inline event-handler scripts, embedded objects, child frames and framing by other pages are blocked.
- Images: self + data URLs; fonts: self.
- Supporting headers: nosniff, DENY framing, no-referrer and disabled camera/microphone/geolocation.

Development allowances are not a production security guarantee. No upgrade-insecure-requests or HSTS is added to this HTTP localhost server: these can disrupt local HTTP/WebSocket development. Production HTTPS/HSTS is a deployment concern.

## Production-build preview policy

`npm run build` emits external JavaScript/CSS assets. `npm run preview` serves these with the strict policy: scripts/styles self only, no unsafe-inline, no unsafe-eval and no local-development WebSocket allowance. The API origin remains allowed. React Router deep links receive the same document headers.

Vite preview is a local verification server, NOT a recommended production hosting server.

## Actual production deployment

CSP headers are not baked into dist/index.html or automatically carried by static files. The production host (for example nginx, Azure, a CDN or a static hosting service) MUST emit equivalent headers on the HTML document, including SPA fallback/deep-link responses. The API's Helmet headers cannot substitute for document headers.

For the current default local API, the strict policy is:

```
default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; frame-src 'none'; form-action 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://localhost:5000; worker-src 'self'; manifest-src 'self'
```

Before public deployment, replace localhost with the approved deployed HTTPS API origin in BOTH VITE_API_URL (build-time) and hosting headers. Configure backend CORS separately for the deployed frontend origin. Configure TLS and carefully reviewed HSTS on the host. Do not deploy with the development policy. A meta tag is not used because frame-ancestors requires a response header.

If future design changes add remote fonts, images, inline styles or external scripts, review the precise origins rather than adding broad wildcards or disabling CSP. CSP complements safe rendering, authentication and server-side authorization; it is not a replacement for them.

## Verification

Execution results and scope are recorded in docs/evidence/csp-* files. Read the final verification section added after the test run for passes and limitations.

### Recorded results — 9 October 2026

- 36/36 tests passed across six suites, including seven CSP regression tests.
- Production build passed with the native config loader (used to avoid sandbox config-bundling access restrictions).
- Development /login returned HTTP 200 with the development CSP, supporting security headers and Vite React Refresh preamble. Verification used port 5183.
- Preview /, /login and /gigs returned HTTP 200 with strict production-preview CSP, supporting headers and external JavaScript/CSS assets. Verification used port 4183.
- The sandbox blocked normal development dependency prebundling. A validation-only resolved optimizer override disabled prebundling for the development HEADER test; it is not part of the project. End-to-end development rendering, actual WebSocket hot reload, authenticated API calls, production browser CSP enforcement and deployment-host headers were NOT verified. The exact-origin API and WebSocket allowances are covered by regression tests.
- Backend CORS remains unchanged. Separate test ports were not used to create accounts or bookings. No backend files were changed by this work; no Git commit or push was performed.

Restart your own frontend with npm run dev, use http://localhost:5173, and confirm browser DevTools Network → document → Response Headers shows Content-Security-Policy. Check Console for CSP violations while navigating and saving a small frontend edit to test HMR in your own environment.
