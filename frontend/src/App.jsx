// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';

// Páginas
import Splash from './pages/Splash.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/onboarding/Onboarding.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Settings from './pages/Settings.jsx';
import GoalDetail from './pages/goals/GoalDetail.jsx';
// Si más adelante creas la vista de detalle:
// import GoalDetail from './pages/dashboard/GoalDetail.jsx';

function AppLayout({ children }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {token && (
        <button
          onClick={() => navigate('/settings')}
          aria-label="Ajustes"
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          <SettingsIcon size={24} color="#FFFFFF" />
        </button>
      )}
      {children}
    </div>
  );
}

export default function App() {
  const { token, loading } = useAuth();

  // Spinner mientras validamos el token
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        Cargando…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Splash: si ya estás autenticado, vas al dashboard */}
          <Route
            path="/"
            element={
              token
                ? <Navigate to="/dashboard" replace />
                : <Splash />
            }
          />

          {/* Públicas: registro y login */}
          <Route
            path="/register"
            element={
              !token
                ? <Register />
                : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/login"
            element={
              !token
                ? <Login />
                : <Navigate to="/dashboard" replace />
            }
          />

          {/* Privadas */}
          <Route
            path="/onboarding"
            element={
              token
                ? <Onboarding />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/dashboard"
            element={
              token
                ? <Dashboard />
                : <Navigate to="/login" replace />
            }
          />
          {/*
          // Ruta de detalle opcional, si la implementas:
          <Route
            path="/goals/:id"
            element={
              token
                ? <GoalDetail />
                : <Navigate to="/login" replace />
            }
          />
          */}

          <Route
            path="/settings"
            element={
              token
                ? <Settings />
                : <Navigate to="/login" replace />
            }
          />

          {/* Catch‑all: redirige según estado */}
          <Route
            path="*"
            element={
              <Navigate to={token ? "/dashboard" : "/"} replace />
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
