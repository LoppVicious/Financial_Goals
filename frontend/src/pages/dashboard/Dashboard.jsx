// frontend/src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GoalCard from '../../components/GoalCard';
import {
  EuroIcon,
  MapPinIcon,
  HomeIcon,
  TrendingUpIcon
} from 'lucide-react';
import '../../styles/global.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // === MOCK TEMPORAL ===
    const mockGoals = [
      {
        id: 1,
        name: 'Meta on‑track',
        type: 'Casa',
        progressPercent: 90,
        monthlyNeed: 0
      },
      {
        id: 2,
        name: 'Meta needing more',
        type: 'Viaje',
        progressPercent: 40,
        monthlyNeed: 150
      },
      {
        id: 3,
        name: 'Meta surplus',
        type: 'Jubilación',
        progressPercent: 60,
        monthlyNeed: -50
      },
      {
        id: 4,
        name: 'Meta just right',
        type: 'Invertir',
        progressPercent: 0,
        monthlyNeed: 0
      }
    ];
    // Simula un retraso de fetch para ver el loading
    setTimeout(() => {
      setGoals(mockGoals);
      setLoading(false);
    }, 500);
    // =======================

    /*
    // Código real de fetch a la API, descomenta cuando quieras:
    fetch('/api/goals', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    */
  }, []);

  if (loading) return <p>{t('dashboard.loading')}</p>;

  if (goals.length === 0) {
    return (
      <div className="empty-state-card">
        <h3 className="empty-title">{t('dashboard.noGoals')}</h3>
        <button
          className="btn-full primary empty-btn"
          onClick={() => navigate('/onboarding')}
        >
          + {t('dashboard.newGoal')}
        </button>
      </div>
    );
  }

  const getIcon = type => {
    switch (type) {
      case 'Casa':
        return <EuroIcon size={24} color="var(--text-primary)" />;
      case 'Viaje':
        return <MapPinIcon size={24} color="var(--text-primary)" />;
      case 'Jubilación':
        return <HomeIcon size={24} color="var(--text-primary)" />;
      case 'Invertir':
        return <TrendingUpIcon size={24} color="var(--text-primary)" />;
      default:
        return <EuroIcon size={24} color="var(--text-primary)" />;
    }
  };

  const computeStatus = goal => {
    const { progressPercent, monthlyNeed } = goal;
    if (progressPercent >= 80) return [t('dashboard.onTrack'), 'green'];
    if (monthlyNeed > 0) return [`+${monthlyNeed} €/mes`, 'red'];
    if (monthlyNeed < 0)
      return [`-${Math.abs(monthlyNeed)} €/mes`, 'orange'];
    return [t('dashboard.onTarget'), 'green'];
  };

  return (
    <div className="p-4">
      {goals.map(goal => {
        const [statusText, statusColor] = computeStatus(goal);
        return (
          <GoalCard
            key={goal.id}
            icon={getIcon(goal.type)}
            title={goal.name}
            progressPercent={goal.progressPercent}
            statusText={statusText}
            statusColor={statusColor}
            onViewDetail={() => navigate(`/goals/${goal.id}`)}
          />
        );
      })}
    </div>
  );
}
