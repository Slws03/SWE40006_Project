import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';

vi.mock('../../hooks/useAuth');
import { useAuth } from '../../hooks/useAuth';

function renderWithRouter(authValue, initialPath = '/admin') {
  useAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin" element={<AdminRoute><div>Admin Panel</div></AdminRoute>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithRouter({ token: null, user: null });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to / when authenticated but not admin', () => {
    renderWithRouter({ token: 'tok', user: { role: 'customer' } });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders children when user is admin', () => {
    renderWithRouter({ token: 'tok', user: { role: 'admin' } });
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
