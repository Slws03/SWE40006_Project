import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function CartSummary({ itemCount, totalAmount }) {
  const { token } = useAuth();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-5">Order Summary</h2>
      <div className="space-y-3 text-sm text-gray-600 mb-5">
        <div className="flex justify-between">
          <span>Items ({itemCount})</span>
          <span className="font-medium text-gray-800">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-green-600 font-semibold">FREE</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-base">
          <span>Total</span>
          <span className="text-green-700 text-lg">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700">
        <span>🚚</span>
        <span>Free shipping on this order!</span>
      </div>

      {token ? (
        <Link
          to="/checkout"
          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
        >
          Proceed to Checkout →
        </Link>
      ) : (
        <div className="space-y-2">
          <Link
            to="/login"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
          >
            Login to Checkout
          </Link>
          <p className="text-xs text-center text-gray-400">You need to login before placing an order</p>
        </div>
      )}
    </div>
  );
}
