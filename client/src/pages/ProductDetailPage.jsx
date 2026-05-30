import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { cartApi } from '../api/cart';
import Spinner from '../components/ui/Spinner';
import ProductImage from '../components/ui/ProductImage';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const { token } = useAuth();
  const addToast = useToast();

  useEffect(() => {
    setLoading(true);
    productsApi.getById(id)
      .then(d => setProduct(d.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    dispatch({ type: 'ADD_ITEM', product, quantity });
    if (token) cartApi.add(product.id, quantity).catch(() => {});
    addToast(`${product.name} × ${quantity} added to cart!`);
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
        <Link to="/products" className="text-green-600 hover:underline">← Back to products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/products" className="text-sm text-green-600 hover:text-green-700 mb-6 inline-flex items-center gap-1">
        ← Back to products
      </Link>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-4 grid md:grid-cols-2 gap-0">
        <div className="aspect-square bg-gray-50">
          <ProductImage
            name={product.name}
            imageUrl={product.image_url}
            className="w-full h-full object-cover"
            textSize="text-base"
          />
        </div>

        <div className="p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs text-green-600 font-semibold uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-3">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3 mt-6">
              <span className="text-4xl font-bold text-green-700">$1.00</span>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                >−</button>
                <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(99, q + 1))}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                >+</button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-lg"
            >
              🛒 Add to Cart — ${(product.price * quantity).toFixed(2)}
            </button>

            <Link
              to="/cart"
              className="block w-full text-center border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 rounded-xl transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
