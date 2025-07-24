// frontend/src/pages/Settings.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { ArrowLeft } from 'lucide-react';
import '../styles/global.css';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const currentLang = i18n.language || 'es';

  const handleLanguageChange = (lang) => {
    if (lang === currentLang) return;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Header con flecha atrás */}
      <div className="header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label={t('settings.back')}
        >
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
      </div>

      <div className="settings-page">
        <h2>{t('settings.title')}</h2>

        {/* Selector de idioma */}
        <section style={{ marginTop: '1.5rem' }}>
          <h3>{t('settings.language')}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className={`btn-full secondary${currentLang === 'es' ? ' active' : ''}`}
              onClick={() => handleLanguageChange('es')}
            >
              Español
            </button>
            <button
              className={`btn-full secondary${currentLang === 'en' ? ' active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
          </div>
        </section>

        {/* Toggle de Tema */}
        <section style={{ marginTop: '2rem' }}>
          <h3>{t('settings.theme')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                aria-label={t('settings.toggleTheme')}
              />
              <span className="slider"></span>
            </label>
            <span>{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</span>
          </div>
        </section>

        {/* Botón de Logout */}
        <section style={{ marginTop: '2rem' }}>
          <button
            type="button"
            className="btn-full secondary"
            onClick={handleLogout}
          >
            {t('settings.logout')}
          </button>
        </section>
      </div>
    </>
  );
}