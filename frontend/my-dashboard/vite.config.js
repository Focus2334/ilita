import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://127.0.0.1:8000'

/** Пути API — проксируются на бэкенд при npm run dev */
const apiProxy = {
  '/auth': backend,
  '/me': backend,
  '/courses': backend,
  '/users': backend,
  '/roles': backend,
  '/mentors': backend,
  '/chat': backend,
  '/ws': { target: backend, ws: true },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      Object.entries(apiProxy).map(([path, target]) => [
        path,
        typeof target === 'string'
          ? { target, changeOrigin: true }
          : { ...target, changeOrigin: true },
      ]),
    ),
  },
})
