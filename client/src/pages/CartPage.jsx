import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { useToast } from '../components/ui/Toast';

export default function CartPage() {
  const { items, itemCount, totalAmount, dispatch } = useCart();
  const addToast = useToast();

  function handleClear() {
    dispatch({ type: 'CLEAR_CART' });
    addToast('Cart cleared', 'warning');
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Start adding some $1.00 items!</p>
        <Link to="/products" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <button
          onClick={handleClear}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {items.map(item => <CartItem key={item.productId} item={item} />)}
          </div>
          <Link to="/products" className="inline-block mt-4 text-sm text-green-600 hover:text-green-700">
            ← Continue Shopping
          </Link>
        </div>

        <div>
          <CartSummary itemCount={itemCount} totalAmount={totalAmount} />
        </div>
      </div>
    </div>
  );
}
