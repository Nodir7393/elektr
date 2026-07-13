import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      proxy: {
        // Docker: VITE_PROXY_TARGET=http://api:8000 (service nomi orqali).
        // Native dev: .env dagi VITE_API_URL yoki localhost:8000.
        '/api': process.env.VITE_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:8000',
      },
    },
  };
});

