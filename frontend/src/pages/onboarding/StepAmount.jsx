import React from 'react';

export default function StepAmount({ form, updateForm, nextStep, prevStep }) {
  return (
    <div>
      <h3>¿Cuánto quieres ahorrar?</h3>

      <input
        type="number"
        placeholder="Monto objetivo"
        value={form.targetAmount}
        onChange={e => updateForm({ targetAmount: e.target.value })}
      />

      <select
        value={form.currency}
        onChange={e => updateForm({ currency: e.target.value })}
      >
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
      </select>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={prevStep}>Atrás</button>
        <button
          onClick={nextStep}
          disabled={!form.targetAmount || isNaN(form.targetAmount)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
