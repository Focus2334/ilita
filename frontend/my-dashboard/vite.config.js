import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') || '/',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const location = proxyRes.headers.location;
            if (
              typeof location === 'string' &&
              location.startsWith('http://127.0.0.1:8000')
            ) {
              proxyRes.headers.location = location.replace(
                'http://127.0.0.1:8000',
                '/api',
              );
            }
          });
        },
      },
    },
  },
})
