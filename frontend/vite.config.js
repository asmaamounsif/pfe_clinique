import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirection des appels /api vers le serveur API Gateway Node.js
      '/api': {
        target: 'http://localhost:3050',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
