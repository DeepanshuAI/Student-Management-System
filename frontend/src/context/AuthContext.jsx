import { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { authApi, isTokenExpired } from '../api/studentApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  // `loading` = true while we're checking stored token on app startup
  const [loading, setLoading] = useState(true);
  const logoutTimerRef        = useRef(null);

  // ── Auto-logout when JWT timer fires ────────────────────────────────────────
  const scheduleAutoLogout = useCallback((token) => {
    const decoded = (() => {
      try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
    })();
    if (!decoded?.exp) return;

    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) return;

    clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      logout('token_expired');
    }, msUntilExpiry);
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback((reason = 'manual') => {
    clearTimeout(logoutTimerRef.current);
    localStorage.removeItem('token');
    setUser(null);
    // Optionally surface the reason (e.g., show a toast from the app)
    if (reason === 'token_expired') {
      window.dispatchEvent(new CustomEvent('auth:session_expired'));
    }
  }, []);

  // ── Listen for 401 events from axios interceptor ─────────────────────────────
  useEffect(() => {
    const handle401 = () => logout('token_expired');
    window.addEventListener('auth:logout', handle401);
    return () => window.removeEventListener('auth:logout', handle401);
  }, [logout]);

  // ── On startup: restore session from localStorage ────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      // Fast client-side expiry check — avoids an unnecessary network round-trip
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      try {
        // Verify with backend & fetch fresh user profile
        const res = await authApi.getMe();
        setUser(res.data.user);
        scheduleAutoLogout(token);
      } catch {
        // 401 / network error — clear and start fresh
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [scheduleAutoLogout]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
    scheduleAutoLogout(token);
    return res.data;
  }, [scheduleAutoLogout]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
