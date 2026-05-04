import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">💰 Dollar Shop</h3>
          <p className="text-green-300 text-sm leading-relaxed">
            Your one-stop shop for everyday essentials, all at the unbeatable price of $1.00.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {['Snacks', 'Stationery', 'Toys', 'Cleaning', 'Beauty'].map(cat => (
              <li key={cat}>
                <Link to={`/products?category=${cat}`} className="text-green-300 hover:text-yellow-400 transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="text-green-300 hover:text-yellow-400 transition-colors">Login</Link></li>
            <li><Link to="/register" className="text-green-300 hover:text-yellow-400 transition-colors">Create Account</Link></li>
            <li><Link to="/profile" className="text-green-300 hover:text-yellow-400 transition-colors">My Orders</Link></li>
            <li><Link to="/cart" className="text-green-300 hover:text-yellow-400 transition-colors">Shopping Cart</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-green-800 py-4 text-center text-xs text-green-400">
        © {new Date().getFullYear()} Dollar Shop — Everything $1.00
      </div>
    </footer>
  );
}
