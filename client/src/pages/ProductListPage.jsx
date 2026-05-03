import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import ProductGrid from '../components/products/ProductGrid';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    productsApi.getCategories().then(d => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    params.limit = 100;
    productsApi.getAll(params)
      .then(d => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  function handleSearch(e) {
    e.preventDefault();
    setSearchParams(p => {
      const next = new URLSearchParams(p);
      if (searchInput) next.set('search', searchInput); else next.delete('search');
      return next;
    });
  }

  function setCategory(cat) {
    setSearchParams(p => {
      const next = new URLSearchParams(p);
      if (cat) next.set('category', cat); else next.delete('category');
      return next;
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Products</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
        {(search || category) && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearchParams({}); }}
            className="border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm text-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {search && (
        <p className="text-sm text-gray-500 mb-4">
          Showing results for "<strong>{search}</strong>" — {products.length} items
        </p>
      )}

      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
