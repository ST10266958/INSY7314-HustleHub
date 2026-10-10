// Frontend document headers, separate from Helmet on the JSON API.
export function createFrontendHeaders({ development = false, apiUrl = 'https://localhost:5000/api', devPort = 5173 } = {}) {
  const api = new URL(apiUrl);
  if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password) {
    throw new Error('VITE_API_URL must be an HTTP(S) URL without credentials.');
  }
  if (!Number.isInteger(devPort) || devPort < 1 || devPort > 65535) {
    throw new Error('VITE_DEV_PORT must be a valid port number.');
  }
  const directives = {
    'default-src': ["'self'"],
    'base-uri': ["'none'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'frame-src': ["'none'"],
    'form-action': ["'self'"],
    // Vite injects an inline React Refresh preamble in development only.
    'script-src': development ? ["'self'", "'unsafe-inline'"] : ["'self'"],
    'script-src-attr': ["'none'"],
    // Vite injects <style> tags for CSS HMR. Builds use external CSS files.
    'style-src': development ? ["'self'", "'unsafe-inline'"] : ["'self'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", api.origin, ...(development ? [`ws://localhost:${devPort}`, `ws://127.0.0.1:${devPort}`, `ws://[::1]:${devPort}`] : [])],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
  };
  return {
    'Content-Security-Policy': Object.entries(directives).map(([key, values]) => `${key} ${[...new Set(values)].join(' ')}`).join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}
