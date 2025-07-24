// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#141A1F',   // App background
        surface:    '#2B3640',   // "Iniciar sesión" button
        accent:     '#DBE8F2',   // "Registrar" button
        textSecondary: '#9EADBF', // small legal text
        white:      '#FFFFFF',
        'text-primary':   '#FFFFFF',
        'text-secondary': '#9EADBF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg:  '12px',
        '2xl':'20px',
      },
      boxShadow: {
        md: '0 4px 6px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
```js
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#141A1E',
        surface:    '#2B3640',
        accent:     '#DBE8F2',
        white:      '#FFFFFF',
        'text-primary':   '#FFFFFF',      // siempre blanco
        'text-secondary': '#DBE8F2',      // color de acento para texto secundario
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg:  '12px',
        '2xl':'20px',
      },
      boxShadow: {
        md: '0 4px 6px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};