import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
