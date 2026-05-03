import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import Spinner from '../components/ui/Spinner';

export default function CheckoutPage() {
  const { items, totalAmount, dispatch } = useCart();
  const addToast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ street: '', city: '', state: '', postcode: '', country: 'Australia' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.street.trim()) errs.street = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.postcode.trim()) errs.postcode = 'Postcode is required';
    if (!form.country.trim()) errs.country = 'Country is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) { addToast('Your cart is empty', 'error'); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const address = `${form.street}, ${form.city}, ${form.state} ${form.postcode}, ${form.country}`.trim().replace(', ,', ',');
      await ordersApi.create(address);
      dispatch({ type: 'CLEAR_CART' });
      addToast('Order placed successfully! 🎉');
      navigate('/profile');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nothing to checkout</h2>
        <Link to="/products" className="text-green-600 hover:underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Shipping Address</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{errors.submit}</div>
            )}

            {[
              ['street', 'Street Address', 'text', '123 Main St'],
              ['city', 'City', 'text', 'Melbourne'],
              ['state', 'State / Province', 'text', 'VIC'],
              ['postcode', 'Postcode', 'text', '3000'],
              ['country', 'Country', 'text', 'Australia']
            ].map(([key, label, type, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); }}
                  placeholder={placeholder}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}

            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-4">This is a demo store. No real payment is processed.</p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Placing Order...' : `Place Order — $${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map(item => (
              <div key={item.productId} className="flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-10 h-10 rounded object-cover bg-gray-100"
                  onError={(e) => { e.target.src = `https://placehold.co/40x40/e5e7eb/6b7280?text=Item`; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">× {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span><span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Shipping</span><span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-lg">
              <span>Total</span><span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
