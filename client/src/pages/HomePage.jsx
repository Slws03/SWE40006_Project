import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import ProductGrid from '../components/products/ProductGrid';

const CATEGORIES = [
  { name: 'Snacks', emoji: '🍿' },
  { name: 'Stationery', emoji: '✏️' },
  { name: 'Toys', emoji: '🎲' },
  { name: 'Cleaning', emoji: '🧹' },
  { name: 'Beauty', emoji: '💄' }
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getAll({ limit: 8 })
      .then(d => setFeatured(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Everything for <span className="text-yellow-400">$1.00</span>
          </h1>
          <p className="text-green-100 text-xl mb-8">
            Snacks, stationery, toys, cleaning supplies & more — all just one dollar!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              to="/register"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg border border-white/30 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow hover:shadow-md p-5 text-center transition-all hover:-translate-y-1 border border-gray-100"
            >
              <span className="text-3xl mb-2">{cat.emoji}</span>
              <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <Link to="/products" className="text-sm text-green-600 hover:text-green-700 font-medium">
            View all →
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* Value banner */}
      <section className="bg-green-50 border-t border-green-100 py-12 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-bold text-gray-800 mb-1">Always $1.00</h3>
            <p className="text-gray-500 text-sm">Every single product is exactly one dollar. No surprises.</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🚚</div>
            <h3 className="font-bold text-gray-800 mb-1">Free Shipping</h3>
            <p className="text-gray-500 text-sm">Free delivery on all orders, no minimum spend.</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-bold text-gray-800 mb-1">Secure Checkout</h3>
            <p className="text-gray-500 text-sm">Your information is always safe with us.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
