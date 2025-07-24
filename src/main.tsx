import './index.css';         // ← Esto carga tu Tailwind + base styles
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
