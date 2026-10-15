import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'admin' | 'supplier' | 'buyer') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.auth.me();
        setUser(me);
      } catch (err) {
        console.error('Failed to load active user from stored token', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setStoredToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const demoLogin = async (role: 'admin' | 'supplier' | 'buyer') => {
    let email = 'buyer@waste2worth.org';
    let password = 'BuyerPassword123!';

    if (role === 'admin') {
      email = 'admin@waste2worth.org';
      password = 'AdminPassword123!';
    } else if (role === 'supplier') {
      email = 'supplier@waste2worth.org';
      password = 'SupplierPassword123!';
    }

    await login(email, password);
  };

  const register = async (data: any) => {
    const res = await api.auth.register(data);
    setStoredToken(res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
