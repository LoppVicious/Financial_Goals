// src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/ui/BottomNav';
import Header from './components/ui/Header';


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

  // Componente wrapper para condicionar el Header
  function WithOptionalHeader({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation();
    return (
      <>
        {pathname !== '/' && <Header />}   {/* solo en rutas distintas de "/" */}
        {children}
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="bg-background text-text-primary min-h-screen flex flex-col">
            
            <Routes>
              <Route
                path="/*"
                element={
                  <WithOptionalHeader>
                    {/* Health-check */}
                    <div className="px-4 py-2 bg-surface flex justify-between items-center">
                      <span className="text-sm">API status: {healthStatus}</span>
                      {/* lo podrías ocultar también en prod */}
                      <button
                        onClick={checkHealth}
                        className="text-sm px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                      >
                        Check API
                      </button>
                    </div>
                    {/* Outlet con el resto de rutas */}
                    <div className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/help" element={<Help />} />
                        {/* Rutas protegidas... */}
                      </Routes>
                    </div>
                    <BottomNav />
                  </WithOptionalHeader>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;