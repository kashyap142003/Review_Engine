import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/webhook-test': {
        target: 'http://localhost:5678',
        changeOrigin: true,
      },
      '/webhook': {
        target: 'http://localhost:5678',
        changeOrigin: true,
      }
    }
  },
});
