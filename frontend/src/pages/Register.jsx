import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import '../styles/global.css';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginLink, setShowLoginLink] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowLoginLink(false);

    try {
      await axios.post(
        '/api/auth/register',
        { name, email, password, gdpr_consent: true }
      );
      navigate('/login');
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message || t('register.errorInvalid');

      if (status === 409) {
        // Email duplicado
        setError(`${message} — ${t('register.alreadyHaveAccount')}`);
        setShowLoginLink(true);
      } else {
        setError(message);
      }
    }
  };

  return (
    <>
      {/* Header con flecha atrás */}
      <div className="header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label={t('register.alt')}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
      </div>

      <div className="register-page">
        <h2>{t('register.title')}</h2>

        {error && (
          <p style={{ color: '#E74C3C', marginTop: '1rem', fontSize: '0.9rem' }}>
            {error}
            {showLoginLink && (
              <button
                onClick={() => navigate('/login')}
                style={{
                  marginLeft: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#1E90FF',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t('register.login')}
              </button>
            )}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <label>{t('register.name')}</label>
          <input
            type="text"
            placeholder={t('register.namePlaceholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            aria-label={t('register.name')}
          />

          {/* Email */}
          <label>{t('register.email')}</label>
          <input
            type="email"
            placeholder={t('register.emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label={t('register.email')}
          />

          {/* Contraseña */}
          <label>{t('register.password')}</label>
          <input
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label={t('register.password')}
          />

          {/* Botón principal */}
          <button type="submit" className="btn-full primary">
            {t('register.submit')}
          </button>

          {/* Botón secundario */}
          <button
            type="button"
            className="btn-full secondary"
            onClick={() => navigate('/login')}
          >
            {t('register.login')}
          </button>
        </form>
      </div>
    </>
  );
}
