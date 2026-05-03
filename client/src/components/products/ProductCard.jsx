import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const addToast = useToast();

  function handleAddToCart(e) {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', product, quantity: 1 });
    addToast(`${product.name} added to cart!`);
  }

  return (
    <Link to={`/products/${product.id}`} className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = `https://placehold.co/300x300/e5e7eb/6b7280?text=${encodeURIComponent(product.name)}`; }}
        />
      </div>
      <div className="p-4">
        <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">{product.category}</span>
        <h3 className="font-semibold text-gray-800 mt-1 leading-tight group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-green-700">$1.00</span>
          <button
            onClick={handleAddToCart}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
