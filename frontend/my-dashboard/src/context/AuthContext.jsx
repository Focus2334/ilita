import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USERS = {
  'admin@company.ru': { password: 'admin', role: 'admin', name: 'Администратор', initials: 'АД' },
  'ivanov@company.ru': { password: 'user', role: 'employee', name: 'Алексей Иванов', initials: 'АИ' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adaptator-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email, password) => {
    const account = USERS[email.toLowerCase()];
    if (!account || account.password !== password) {
      return { ok: false, error: 'Неверный email или пароль' };
    }
    const session = {
      email: email.toLowerCase(),
      role: account.role,
      name: account.name,
      initials: account.initials,
    };
    setUser(session);
    localStorage.setItem('adaptator-user', JSON.stringify(session));
    return { ok: true, role: account.role };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('adaptator-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
