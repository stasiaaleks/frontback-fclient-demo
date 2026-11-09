import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev the browser talks only to Vite; /api (including the SSE stream) is forwarded to Express,
// so cookies stay same-origin exactly like in production
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3003'
    }
  }
});
