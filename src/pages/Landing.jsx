// src/pages/Landing.jsx
import React from 'react';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-semibold text-center text-text-primary mb-4">
        Planifica tu futuro<br/>
        <span className="text-accent">financiero</span>
      </h1>
      <p className="text-base text-text-secondary text-center mb-12 px-4">
        Toma el control de tus finanzas y alcanza tus metas con nuestras herramientas de planificación intuitivas.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <Button variant="primary" className="w-full text-lg">
          Empezar
        </Button>
        <Button variant="secondary" className="w-full text-lg border border-accent">
          Iniciar sesión
        </Button>
      </div>

      <div className="mt-auto mb-8 text-center px-4">
        <p className="text-xs text-text-secondary">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="underline hover:text-accent">Términos de Servicio</a>{' '}
          y{' '}
          <a href="/privacy" className="underline hover:text-accent">Política de Privacidad</a>.
        </p>
      </div>
    </div>
  );
}