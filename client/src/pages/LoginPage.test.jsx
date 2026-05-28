import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

vi.mock('../api/auth');
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useCart');
vi.mock('../components/ui/Toast');

import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ login: vi.fn() });
    useCart.mockReturnValue({ syncWithServer: vi.fn().mockResolvedValue(undefined) });
    useToast.mockReturnValue(vi.fn());
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
  });

  it('shows error when email is empty on submit', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'notanemail');
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
  });

  it('shows error when password is empty on submit', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('displays API error message on failed login', async () => {
    authApi.login = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('calls login with token and user on successful submit', async () => {
    const mockLogin = vi.fn();
    useAuth.mockReturnValue({ login: mockLogin });
    authApi.login = vi.fn().mockResolvedValue({ token: 'tok', user: { name: 'Alice', role: 'customer' } });

    renderPage();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('tok', expect.objectContaining({ name: 'Alice' })));
  });
});
