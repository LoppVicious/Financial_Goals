import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CreateGoal from './pages/goals/CreateGoal';
import GoalDetail from './pages/goals/GoalDetail';
import Help from './pages/Help';

import { api } from './services/api';          // <-- cliente Axios
import 'tailwindcss/tailwind.css';             // opcional, según uses Tailwind

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  const [healthStatus, setHealthStatus] = useState('—');

  const checkHealth = async () => {
    try {
      const { data } = await api.get('/health');
      setHealthStatus(`${data.status} @ ${new Date(data.timestamp).toLocaleTimeString()}`);
    } catch (err) {
      console.error(err);
      setHealthStatus('ERROR');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Barra superior de comprobación de API */}
        <div className="bg-gray-100 p-4 flex items-center justify-between">
          <span className="font-medium">API status: {healthStatus}</span>
          <button
            onClick={checkHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Check API Health
          </button>
        </div>

        {/* Router de la aplicación */}
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/goals/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateGoal />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/goals/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GoalDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
