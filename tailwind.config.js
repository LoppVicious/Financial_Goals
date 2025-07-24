/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      spacing: {
        4: '16px', 6: '24px', 8: '32px'
      },
      borderRadius: {
        lg:  '12px',
        '2xl': '20px',
      },
      boxShadow: {
        md: '0 4px 6px rgba(0,0,0,0.5)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}