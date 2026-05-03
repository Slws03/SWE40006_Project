import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, dispatch } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch({ type: 'CLEAR_CART' });
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-green-700 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-green-200 transition-colors">
          💰 Dollar Shop
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/products" className="hover:text-green-200 transition-colors text-sm font-medium">
            Products
          </Link>

          <Link to="/cart" className="relative hover:text-green-200 transition-colors">
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm hover:text-green-200 transition-colors font-medium">
                👤 {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-green-800 hover:bg-green-900 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm hover:text-green-200 transition-colors font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-yellow-400 text-green-900 hover:bg-yellow-300 px-3 py-1 rounded font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
