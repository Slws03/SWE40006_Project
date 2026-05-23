import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';
import ProductImage from '../ui/ProductImage';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const addToast = useToast();

  function handleAddToCart(e) {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', product, quantity: 1 });
    addToast(`${product.name} added to cart!`);
  }

  return (
    <Link to={`/products/${product.id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-0.5">
      <div className="aspect-square overflow-hidden bg-gray-50">
        <ProductImage
          name={product.name}
          imageUrl={product.image_url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          textSize="text-sm"
        />
      </div>
      <div className="p-4">
        <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">{product.category}</span>
        <h3 className="font-semibold text-gray-800 mt-1 mb-3 leading-tight group-hover:text-green-700 transition-colors min-h-[2.5rem] line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-700">$1.00</span>
          <button
            onClick={handleAddToCart}
            className="text-xs bg-green-600 hover:bg-green-700 active:scale-95 text-white px-3 py-1.5 rounded-lg transition-all font-semibold"
          >
            + Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
