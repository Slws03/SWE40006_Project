import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';

vi.mock('../api/auth');
vi.mock('../hooks/useAuth');
vi.mock('../components/ui/Toast');

import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ login: vi.fn() });
    useToast.mockReturnValue(vi.fn());
  });

  it('renders all form fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument();
  });

  it('shows error when name is empty', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'notanemail');
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
  });

  it('shows error when password is too short', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), 'abc');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Repeat password'), 'different');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('displays API error on failed registration', async () => {
    authApi.register = vi.fn().mockRejectedValue(new Error('Email already in use'));
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Repeat password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });

  it('calls login with token and user on successful registration', async () => {
    const mockLogin = vi.fn();
    useAuth.mockReturnValue({ login: mockLogin });
    authApi.register = vi.fn().mockResolvedValue({ token: 'tok', user: { name: 'Alice', role: 'customer' } });

    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await userEvent.type(screen.getByPlaceholderText('Min 6 characters'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Repeat password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('tok', expect.objectContaining({ name: 'Alice' })));
  });
});
