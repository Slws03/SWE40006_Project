import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, dispatch } = useCart();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  function handleLogout() {
    dispatch({ type: 'CLEAR_CART' });
    logout();
    navigate('/');
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = searchInput.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchInput('');
  }

  return (
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-extrabold tracking-tight hover:text-yellow-300 transition-colors shrink-0">
          💰 BROKEN - DO NOT USE
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-green-600/60 placeholder-green-200 text-white border border-green-500 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-green-600"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-green-200 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/products" className="hidden sm:block hover:text-yellow-300 transition-colors text-sm font-medium">
            Products
          </Link>

          <Link to="/cart" className="relative hover:text-yellow-300 transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13l-1-5m10 5l.5 6M10 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to="/admin" className="hidden sm:block text-sm font-medium bg-yellow-400 text-green-900 hover:bg-yellow-300 px-3 py-1.5 rounded-lg transition-colors">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm hover:text-yellow-300 transition-colors font-medium">
                <div className="w-7 h-7 rounded-full bg-yellow-400 text-green-900 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm hover:text-yellow-300 transition-colors font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-yellow-400 text-green-900 hover:bg-yellow-300 px-3 py-1.5 rounded-lg font-semibold transition-colors"
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
