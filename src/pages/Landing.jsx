// src/pages/Landing.tsx
import React from 'react';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
      {/* (sin logo/pill) */}

      <h1 className="text-3xl font-semibold text-center text-text-primary mb-2">
        Planifica tu futuro<br />
        <span className="text-primary">financiero</span>
      </h1>
      <p className="text-base text-text-secondary text-center mb-8 px-4">
        Toma el control de tus finanzas y alcanza tus metas con nuestras herramientas de planificación intuitivas.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <Button
          variant="primary"
          className="w-full py-4 rounded-full text-lg"
        >
          Empezar
        </Button>
        <Button
          variant="secondary"
          className="w-full py-4 rounded-full text-lg border border-text-secondary"
        >
          Iniciar sesión
        </Button>
      </div>

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
