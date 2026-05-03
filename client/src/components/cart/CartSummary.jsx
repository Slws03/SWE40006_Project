import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function CartSummary({ itemCount, totalAmount }) {
  const { token } = useAuth();

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Items ({itemCount})</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">FREE</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {token ? (
        <Link
          to="/checkout"
          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Proceed to Checkout
        </Link>
      ) : (
        <div className="space-y-2">
          <Link
            to="/login"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Login to Checkout
          </Link>
          <p className="text-xs text-center text-gray-500">You need to login before placing an order</p>
        </div>
      )}
    </div>
  );
}
