import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const token = localStorage.getItem('phishshield_token');
    if (token) {
      api.getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('phishshield_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('phishshield_token', data.access_token);
    setUser(data.user);
    setAuthModalOpen(false);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('phishshield_token', data.access_token);
    setUser(data.user);
    setAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('phishshield_token');
    setUser(null);
  };

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        openLogin,
        openRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
