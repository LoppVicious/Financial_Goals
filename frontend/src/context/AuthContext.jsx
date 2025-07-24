// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(() => localStorage.getItem('token') || '');
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(!!token);

  // Configura axios para incluir siempre el token en headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Al arrancar con token, obtén el perfil
      fetchMe();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  // Llamada a GET /api/auth/me
  const fetchMe = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('fetchMe error:', err);
      // Si devuelve 401/404, token inválido: haz logout
      setToken('');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Login: guardamos token y disparar fetchMe
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true);
  };

  // Logout: limpia todo
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}
