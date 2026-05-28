import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from './useAuth';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth', () => {
  beforeEach(() => localStorage.clear());

  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
  });

  it('starts with null user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('login sets user and token in state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login('tok123', { id: 1, name: 'Alice', role: 'customer' }));
    expect(result.current.token).toBe('tok123');
    expect(result.current.user.name).toBe('Alice');
  });

  it('login persists token and user to localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login('tok123', { id: 1, name: 'Alice' }));
    expect(localStorage.getItem('dollar_shop_token')).toBe('tok123');
    expect(JSON.parse(localStorage.getItem('dollar_shop_user')).name).toBe('Alice');
  });

  it('logout clears user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login('tok123', { id: 1, name: 'Alice' }));
    act(() => result.current.logout());
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('dollar_shop_token')).toBeNull();
  });

  it('updateUser updates the user in state and localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login('tok123', { id: 1, name: 'Alice', role: 'customer' }));
    act(() => result.current.updateUser({ id: 1, name: 'Alice Updated', role: 'admin' }));
    expect(result.current.user.name).toBe('Alice Updated');
    expect(result.current.user.role).toBe('admin');
  });

  it('reads persisted token and user from localStorage on mount', () => {
    localStorage.setItem('dollar_shop_token', 'persisted_tok');
    localStorage.setItem('dollar_shop_user', JSON.stringify({ id: 1, name: 'Bob', role: 'customer' }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.token).toBe('persisted_tok');
    expect(result.current.user.name).toBe('Bob');
  });
});
