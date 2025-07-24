// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Header    from './components/ui/Header';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Help from './pages/Help';
import Dashboard from './pages/dashboard/Dashboard';
import CreateGoal from './pages/goals/CreateGoal';
import GoalDetail from './pages/goals/GoalDetail';

import { api } from './services/api';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 300_000 },
  },
});

function App() {
  const [healthStatus, setHealthStatus] = useState('—');

  const checkHealth = async () => {
    try {
      const { data } = await api.get('/health');
      setHealthStatus(`${data.status} @ ${new Date(data.timestamp).toLocaleTimeString()}`);
    } catch {
      setHealthStatus('ERROR');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="bg-background text-text-primary min-h-screen flex flex-col">
            <div className="px-4 py-2 bg-surface flex justify-between items-center">
              <span className="text-sm">API status: {healthStatus}</span>
              <button
                onClick={checkHealth}
                className="text-sm px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Check API
              </button>
            </div>

            <div className="flex-1 overflow-auto">
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
            </div>

            <BottomNav />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
