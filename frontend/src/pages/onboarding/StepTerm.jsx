import React from 'react';

export default function StepTerm({ form, updateForm, nextStep, prevStep }) {
  return (
    <div>
      <h3>¿En qué plazo?</h3>

      {/* Si prefieres datepicker, importa tu componente aquí */}
      <input
        type="date"
        value={form.targetDate}
        onChange={e => {
          updateForm({ targetDate: e.target.value, yearsToGoal: null });
        }}
      />

      {/* Alternativa a años: */}
      <input
        type="number"
        placeholder="Años hasta la meta"
        value={form.yearsToGoal || ''}
        onChange={e => {
          updateForm({ yearsToGoal: Number(e.target.value), targetDate: '' });
        }}
      />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={prevStep}>Atrás</button>
        <button
          onClick={nextStep}
          disabled={!form.targetDate && !form.yearsToGoal}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
