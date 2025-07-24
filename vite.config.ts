// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',    // expone en todas las interfaces
    port: 5173,         // fuerza el puerto
    strictPort: true    // si 5173 está ocupado, Vite fallará en lugar de cambiar
  }
})
