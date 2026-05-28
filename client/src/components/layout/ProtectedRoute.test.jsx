import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../../hooks/useAuth');
import { useAuth } from '../../hooks/useAuth';

function renderWithRouter(token, initialPath = '/profile') {
  useAuth.mockReturnValue({ token });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/profile" element={<ProtectedRoute><div>Profile Page</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithRouter(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithRouter('valid_token');
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });
});
