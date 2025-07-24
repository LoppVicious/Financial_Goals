// frontend/src/pages/onboarding/StepType.jsx
import React from 'react';

export default function StepType({
  form,
  updateForm,
  nextStep,
  prevStep,
  currentStep,
  totalSteps
}) {
  return (
    <div>
      <h3>¿Qué tipo de meta quieres crear?</h3>

      {/* Selector de tipo de meta */}
      <select
        value={form.name}
        onChange={e => updateForm({ name: e.target.value })}
      >
        <option value="">{/* traducir con t() si usas i18n */}Selecciona...</option>
        <option value="Casa">Casa</option>
        <option value="Viaje">Viaje</option>
        <option value="Jubilación">Jubilación</option>
        <option value="Otro">Otro</option>
      </select>

      <div style={{ marginTop: '1rem' }}>
        {/* Mostrar botón “Atrás” sólo si no estamos en el primer paso */}
        {currentStep > 0 && (
          <button onClick={prevStep}>
            Atrás
          </button>
        )}

        {/* “Siguiente” deshabilitado si no hay nombre */}
        <button
          onClick={nextStep}
          disabled={!form.name}
          style={{ marginLeft: currentStep > 0 ? '0.5rem' : 0 }}
        >
          Siguiente
        </button>
      </div>

      <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#9EADBF' }}>
        Paso {currentStep + 1} de {totalSteps}
      </footer>
    </div>
  );
}
