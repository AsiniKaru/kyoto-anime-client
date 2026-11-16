import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // The frontend talks to "/api" and Vite forwards it to the Express server.
      // Port 5050 keeps this project clear of other local Express apps.
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
});
