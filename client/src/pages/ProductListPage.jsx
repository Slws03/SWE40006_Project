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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {products.length} item{products.length !== 1 ? 's' : ''}
              {category ? ` in ${category}` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Search
        </button>
        {(search || category) && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearchParams({}); }}
            className="border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm text-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!category ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${category === cat ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
