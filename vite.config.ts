// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // expone en todas las IPs
    port: 5173,        // fuerza el 5173
    strictPort: true   // si 5173 está ocupado, falla en vez de cambiar
  }
})
