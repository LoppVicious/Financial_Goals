// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/global.css';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        '/api/auth/login',
        { email, password }
      );
      const { token } = res.data;
      login(token);               // Guarda token en contexto y localStorage
      navigate('/dashboard');     // O '/onboarding' si prefieres forzar el wizard
    } catch (err) {
      // Muestra mensaje según status
      if (err.response?.status === 401) {
        setError(t('login.errorInvalid')); // por ejemplo "Credenciales inválidas"
      } else {
        setError(err.response?.data?.message || t('login.errorInvalid'));
      }
    }
  };

  return (
    <>
      <div className="header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label={t('login.alt')}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
      </div>

      <div className="login-page">
        <h2>{t('login.title')}</h2>

        {error && (
          <p style={{ color: '#E74C3C', marginTop: '1rem', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>{t('login.email')}</label>
          <input
            type="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label={t('login.email')}
          />

          <label>{t('login.password')}</label>
          <input
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label={t('login.password')}
          />

          <button type="submit" className="btn-full primary">
            {t('login.submit')}
          </button>

          <button
            type="button"
            className="btn-full secondary"
            onClick={() => navigate('/register')}
          >
            {t('Crear cuenta')}
          </button>
        </form>
      </div>
    </>
  );
}
