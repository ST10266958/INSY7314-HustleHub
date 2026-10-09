import { createFrontendHeaders } from '../../csp';
const policy = options => createFrontendHeaders(options)['Content-Security-Policy'];
test('development allows Vite preamble, CSS HMR, API and exact local WebSockets', () => {
  const csp = policy({development:true});
  expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  expect(csp).toContain('https://localhost:5000');
  expect(csp).toContain('ws://localhost:5173');
  expect(csp).not.toContain('unsafe-eval');
});
test('production blocks inline scripts/styles and has no development WebSockets', () => {
  const csp = policy({apiUrl:'https://api.example.test/api'});
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("style-src 'self'");
  expect(csp).not.toContain('unsafe-inline');
  expect(csp).not.toContain('ws://');
  expect(csp).toContain("connect-src 'self' https://api.example.test");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
});
test('uses only API origin, not its path or query', () => {
  const csp = policy({apiUrl:'https://api.example.test:8443/api?setting=value'});
  expect(csp).toContain('https://api.example.test:8443');
  expect(csp).not.toContain('?setting');
});
test('custom development port is reflected in WebSocket allowlist', () => {
  expect(policy({development:true,devPort:5183})).toContain('ws://127.0.0.1:5183');
});
test.each(['javascript:alert(1)','https://user:password@example.test/api'])('rejects unsafe API configuration %s',apiUrl=>{
  expect(()=>createFrontendHeaders({apiUrl})).toThrow();
});
test('includes supporting headers and denies attribute scripts', () => {
  const headers=createFrontendHeaders();
  expect(headers['X-Frame-Options']).toBe('DENY');
  expect(headers['X-Content-Type-Options']).toBe('nosniff');
  expect(headers['Content-Security-Policy']).toContain("script-src-attr 'none'");
});
