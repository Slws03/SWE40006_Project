import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';

export default function CartItem({ item }) {
  const { dispatch } = useCart();
  const addToast = useToast();

  function changeQty(delta) {
    dispatch({ type: 'UPDATE_QTY', productId: item.productId, quantity: item.quantity + delta });
  }

  function remove() {
    dispatch({ type: 'REMOVE_ITEM', productId: item.productId });
    addToast(`${item.name} removed from cart`, 'warning');
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
        onError={(e) => { e.target.src = `https://placehold.co/64x64/e5e7eb/6b7280?text=Item`; }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-sm text-green-600 font-semibold">${item.price.toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => changeQty(-1)}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
        >−</button>
        <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
        <button
          onClick={() => changeQty(1)}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
        >+</button>
      </div>
      <div className="text-right min-w-[60px]">
        <p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
        <button onClick={remove} className="text-xs text-red-500 hover:text-red-700 transition-colors mt-1">
          Remove
        </button>
      </div>
    </div>
  );
}
