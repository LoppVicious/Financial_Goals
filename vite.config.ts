// vite.config.ts
import { defineConfig } from 'vite'
import react      from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [ react() ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // esto quita el prefijo "/api" en la URL que recibe Express
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
