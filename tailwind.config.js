// tailwind.config.js
import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  theme: {
    extend: {
      colors: {
        background:      '#121212',
        surface:         '#1E1E1E',
        primary:         '#3B82F6',
        secondary:       '#10B981',
        error:           '#EF4444',
        'text-primary':   '#FFFFFF',
        'text-secondary': '#A0A0A0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        '2xl': '20px',
      },
      boxShadow: {
        md: '0 4px 6px rgba(0,0,0,0.5)',
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  }
})
