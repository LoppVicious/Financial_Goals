// frontend/src/pages/Splash.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/global.css';

export default function Splash() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="splash">
      <div className="graphic">
        <img
          src="/splash-graphic.png"
          alt={t('splash.title')}
          loading="lazy"
        />
      </div>
      <h1>{t('splash.title')}</h1>
      <p>{t('splash.desc')}</p>
      <div className="actions">
        <button
          className="btn-primary"
          onClick={() => navigate('/register')}
        >
          {t('splash.start')}
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate('/login')}
        >
          {t('splash.login')}
        </button>
      </div>
      <div className="legal">{t('splash.legal')}</div>
    </div>
  );
}
