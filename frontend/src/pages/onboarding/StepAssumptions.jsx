import React from 'react';

export default function StepAssumptions({ form, updateForm, nextStep, prevStep }) {
  return (
    <div>
      <h3>Supuestos</h3>

      <label>
        Inflación (%):
        <input
          type="number"
          step="0.1"
          value={form.defaultInflation * 100}
          onChange={e =>
            updateForm({ defaultInflation: Number(e.target.value) / 100 })
          }
        />
      </label>

      <label>
        Rentabilidad esperada (%):
        <input
          type="number"
          step="0.1"
          value={form.defaultReturn * 100}
          onChange={e =>
            updateForm({ defaultReturn: Number(e.target.value) / 100 })
          }
        />
      </label>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={prevStep}>Atrás</button>
        <button onClick={nextStep}>Siguiente</button>
      </div>
    </div>
  );
}
