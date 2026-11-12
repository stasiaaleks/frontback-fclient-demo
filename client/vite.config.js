import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// proxy /api to express so cookies stay same-origin in dev
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3003'
    }
  }
});
