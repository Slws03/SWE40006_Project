import { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dollar_shop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dollar_shop_token') || null);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('dollar_shop_token', newToken);
    localStorage.setItem('dollar_shop_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dollar_shop_token');
    localStorage.removeItem('dollar_shop_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    localStorage.setItem('dollar_shop_user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
