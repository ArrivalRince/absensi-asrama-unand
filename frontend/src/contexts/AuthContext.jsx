import React, { createContext, useContext, useEffect, useState } from 'react';
import { request } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('asrama_token')));

  useEffect(() => {
    if (!localStorage.getItem('asrama_token')) return;
    request('/auth/me')
      .then((result) => setUser(result.user))
      .catch(() => localStorage.removeItem('asrama_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    localStorage.setItem('asrama_token', result.token);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem('asrama_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}