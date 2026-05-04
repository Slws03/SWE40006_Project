import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import ProductGrid from '../components/products/ProductGrid';

const CATEGORIES = [
  { name: 'Snacks', emoji: '🍿', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300', text: 'text-orange-700' },
  { name: 'Stationery', emoji: '✏️', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300', text: 'text-blue-700' },
  { name: 'Toys', emoji: '🎲', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300', text: 'text-purple-700' },
  { name: 'Cleaning', emoji: '🧹', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100 hover:border-teal-300', text: 'text-teal-700' },
  { name: 'Beauty', emoji: '💄', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100 hover:border-pink-300', text: 'text-pink-700' },
];

const VALUE_PROPS = [
  { icon: '💰', title: 'Always $1.00', desc: 'Every product is exactly one dollar. No hidden fees, no surprises.' },
  { icon: '🚚', title: 'Free Shipping', desc: 'Free delivery on all orders with no minimum spend required.' },
  { icon: '🔒', title: 'Secure Checkout', desc: 'Your payment info is encrypted and always kept safe.' },
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
      {/* Announcement bar */}
      <div className="bg-yellow-400 text-green-900 text-center text-sm font-semibold py-2 px-4">
        🎉 New arrivals every week — all just $1.00!
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/30 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            💵 Everything for just $1.00
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-5 leading-tight">
            Shop Smart,<br />
            <span className="text-yellow-400">Spend Less</span>
          </h1>
          <p className="text-green-200 text-xl mb-10 max-w-2xl mx-auto">
            Snacks, stationery, toys, cleaning supplies & more — browse hundreds of products, all at a flat $1.00 price.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Shop Now →
            </Link>
            <Link
              to="/register"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg border border-white/30 transition-all hover:-translate-y-0.5"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find exactly what you're looking for</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-md ${cat.color}`}
            >
              <span className="text-4xl mb-3">{cat.emoji}</span>
              <span className={`text-sm font-semibold ${cat.text}`}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked items you'll love</p>
          </div>
          <Link to="/products" className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 group">
            View all
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* Value banner */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 border-t border-green-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">Why Shop With Us?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {VALUE_PROPS.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
