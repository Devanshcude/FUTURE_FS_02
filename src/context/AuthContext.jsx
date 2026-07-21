import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext(null);

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Set axios auth header
  const setAxiosAuth = useCallback((tkn) => {
    if (tkn) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Validate stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('crm_token');
    const storedUser = localStorage.getItem('crm_user');

    if (storedToken && storedUser) {
      setAxiosAuth(storedToken);
      setToken(storedToken);

      // Verify token is still valid
      authClient
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          // Token invalid - clear
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
          setToken(null);
          setUser(null);
          setAxiosAuth(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [setAxiosAuth]);

  const login = async (email, password) => {
    const res = await authClient.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('crm_token', newToken);
    localStorage.setItem('crm_user', JSON.stringify(newUser));
    setAxiosAuth(newToken);
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setAxiosAuth(null);
    setToken(null);
    setUser(null);
  }, [setAxiosAuth]);

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('crm_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
