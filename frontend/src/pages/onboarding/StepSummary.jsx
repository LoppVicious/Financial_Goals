import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function StepSummary({ form, prevStep, navigate }) {
  const { token } = useAuth();

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          targetAmount: Number(form.targetAmount),
          currency: form.currency,
          targetDate: form.targetDate || null,
          yearsToGoal: form.yearsToGoal,
          defaultInflation: form.defaultInflation,
          defaultReturn: form.defaultReturn,
        }),
      });
      if (!res.ok) throw new Error('Error creando meta');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // TODO: mostrar notificación de error al usuario
    }
  };

  return (
    <div>
      <h3>Resumen de tu meta</h3>
      <ul>
        <li><strong>Tipo:</strong> {form.name}</li>
        <li><strong>Monto:</strong> {form.targetAmount} {form.currency}</li>
        <li>
          <strong>Plazo:</strong>{' '}
          {form.targetDate
            ? new Date(form.targetDate).toLocaleDateString()
            : `${form.yearsToGoal} años`}
        </li>
        <li><strong>Inflación:</strong> {(form.defaultInflation * 100).toFixed(1)}%</li>
        <li><strong>Rentabilidad:</strong> {(form.defaultReturn * 100).toFixed(1)}%</li>
      </ul>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={prevStep}>Atrás</button>
        <button onClick={handleSubmit}>Confirmar</button>
      </div>
    </div>
  );
}
