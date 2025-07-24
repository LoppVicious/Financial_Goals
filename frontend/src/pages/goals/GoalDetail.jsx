// frontend/src/pages/goals/GoalDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit2, ArrowLeft } from 'lucide-react';
import "../../styles/global.css";

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch de la meta individual
  useEffect(() => {
    fetch(`/api/goals/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error fetching goal');
        return res.json();
      })
      .then(data => setGoal(data))
      .catch(err => {
        console.error(err);
        // Si id inválido, volvemos al dashboard
        navigate('/dashboard', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = () => {
    if (!window.confirm(t('goalDetail.confirmDelete'))) return;
    fetch(`/api/goals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error deleting');
        navigate('/dashboard');
      })
      .catch(err => console.error(err));
  };

  if (loading) return <p>{t('goalDetail.loading')}</p>;

  const {
    title,
    amount,
    currency,
    targetDate,
    currentAmount,
    progressPercent,
    monthlyNeed,
    defaultInflation,
    defaultReturn
  } = goal;

  return (
    <div className="p-4 space-y-6">
      {/* Header con back */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {t('goalDetail.title')}
        </h2>
      </div>

      {/* Info básica */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p>
          {t('goalDetail.target')}: {amount} {currency} ({new Date(targetDate).toLocaleDateString()})
        </p>
        <p>
          {t('goalDetail.current')}: {currentAmount} {currency}
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--green)' }}
          />
        </div>
        <p>
          {t('goalDetail.progress')}: {progressPercent}%
        </p>
      </div>

      {/* Supuestos */}
      <div className="card space-y-2">
        <h4 className="text-base font-semibold">{t('goalDetail.assumptions')}</h4>
        <p>
          {t('goalDetail.inflation')}: {defaultInflation}%
        </p>
        <p>
          {t('goalDetail.return')}: {defaultReturn}%
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-4">
        <button onClick={() => navigate(`/onboarding?edit=${id}`)} className="btn-full secondary flex-1">
          <Edit2 size={16} className="mr-2" /> {t('goalDetail.edit')}
        </button>
        <button onClick={handleDelete} className="btn-full secondary flex-1">
          <Trash2 size={16} className="mr-2" /> {t('goalDetail.delete')}
        </button>
      </div>
    </div>
  );
}
