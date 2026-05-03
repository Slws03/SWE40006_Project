import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  const { state, dispatch, syncWithServer } = ctx;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items: state.items, status: state.status, itemCount, totalAmount, dispatch, syncWithServer };
}
