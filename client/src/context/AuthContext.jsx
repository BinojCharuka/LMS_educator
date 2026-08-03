import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides authentication state and actions.
 * Persists user + token in localStorage for session continuity.
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('educator_token');
    const storedUser  = localStorage.getItem('educator_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ── login: called after successful /api/auth/login ─────────────────────────
  const login = (tokenValue, userData) => {
    localStorage.setItem('educator_token', tokenValue);
    localStorage.setItem('educator_user',  JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('educator_token');
    localStorage.removeItem('educator_user');
    setToken(null);
    setUser(null);
  };

  // ── Refresh user data from API ──────────────────────────────────────────────
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('educator_user', JSON.stringify(data.user));
      }
    } catch {
      logout();
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume auth context */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
