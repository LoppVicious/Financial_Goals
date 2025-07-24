// src/pages/Landing.tsx
import React from 'react';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
      {/* Hero image */}
      <div className="w-full max-w-xs mb-8">
        <img
          src="/hero-plant.png"
          alt="Planta y Fintech"
          className="w-full rounded-2xl shadow-md"
        />
      </div>

      {/* Titular */}
      <h1 className="text-2xl font-semibold text-center text-text-primary mb-2">
        Planifica tu futuro<br/>
        <span className="text-primary">financiero</span>
      </h1>
      <p className="text-sm text-text-secondary text-center mb-8 px-4">
        Toma el control de tus finanzas y alcanza tus metas con nuestras herramientas de planificación intuitivas.
      </p>

      {/* Botones */}
      <div className="space-y-4 w-full max-w-xs">
        <Button variant="primary" className="w-full">
          Empezar
        </Button>
        <Button variant="secondary" className="w-full">
          Iniciar sesión
        </Button>
      </div>

      {/* Footer legal */}
      <p className="text-xs text-text-secondary mt-12 text-center px-4">
        Al continuar, aceptas nuestros{' '}
        <a href="/terms" className="underline hover:text-primary">
          Términos de Servicio
        </a>{' '}
        y{' '}
        <a href="/privacy" className="underline hover:text-primary">
          Política de Privacidad
        </a>.
      </p>
    </div>
  );
}
