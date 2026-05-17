import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

const PRIVILEGED_ROLES = new Set(['admin', 'hr']);

function buildSession(me, token) {
  const name = `${me.first_name} ${me.last_name}`.trim();
  const initials = `${me.first_name?.[0] || ''}${me.last_name?.[0] || ''}`.toUpperCase();
  const isAdmin = (me.roles || []).some((role) => PRIVILEGED_ROLES.has(role));

  return {
    id: me.id,
    email: me.email,
    name,
    initials,
    roles: me.roles || [],
    role: isAdmin ? 'admin' : 'employee',
    token,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptator-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    try {
      const tokenData = await authApi.login(email, password);
      localStorage.setItem(
        'adaptator-user',
        JSON.stringify({ token: tokenData.access_token }),
      );

      const me = await authApi.getMe();

      const session = buildSession(me, tokenData.access_token);
      setUser(session);
      localStorage.setItem('adaptator-user', JSON.stringify(session));
      return { ok: true, role: session.role };
    } catch (err) {
      return { ok: false, error: err.message || 'Неверный email или пароль' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('adaptator-user');
    localStorage.removeItem('adaptator-data');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
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
