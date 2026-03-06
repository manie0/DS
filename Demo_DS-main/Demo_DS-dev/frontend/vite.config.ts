import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Todas las llamadas a /alerts y /setup se redirigen al backend NestJS
      '/alerts': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/setup': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
