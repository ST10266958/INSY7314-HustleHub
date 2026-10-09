import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createFrontendHeaders } from './csp.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || 'https://localhost:5000/api';
  const devPort = Number(process.env.VITE_DEV_PORT || env.VITE_DEV_PORT || 5173);
  return {
    plugins: [react()],
    server: {
      port: devPort,
      strictPort: true,
      headers: createFrontendHeaders({ development: true, apiUrl, devPort }),
    },
    preview: {
      headers: createFrontendHeaders({ development: false, apiUrl }),
    },
  };
});
