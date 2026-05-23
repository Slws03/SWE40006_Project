import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';
import ProductImage from '../ui/ProductImage';

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
      <ProductImage
        name={item.name}
        imageUrl={item.image_url}
        className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
        textSize="text-xs"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{item.name}</p>
        <p className="text-sm text-green-600 font-medium mt-0.5">${Number(item.price).toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => changeQty(-1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
        >−</button>
        <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
        <button
          onClick={() => changeQty(1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
        >+</button>
      </div>
      <div className="text-right min-w-[64px]">
        <p className="font-bold text-gray-800">${(Number(item.price) * item.quantity).toFixed(2)}</p>
        <button onClick={remove} className="text-xs text-red-400 hover:text-red-600 transition-colors mt-1">
          Remove
        </button>
      </div>
    </div>
  );
}
