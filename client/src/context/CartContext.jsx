import { createContext, useReducer, useEffect, useCallback } from 'react';
import { cartReducer, initialCartState } from './cartReducer';

const STORAGE_KEY = 'dollar_shop_cart';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...init, items: JSON.parse(saved) };
    } catch {}
    return init;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const syncWithServer = useCallback(async (token) => {
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const { items } = await res.json();
      // Convert server format to client format
      const serverItems = items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        image_url: i.image_url,
        quantity: i.quantity
      }));

      // Merge: local-only items get pushed to server, server wins on conflicts
      const localItems = state.items;
      const serverIds = new Set(serverItems.map(i => i.productId));
      const localOnly = localItems.filter(i => !serverIds.has(i.productId));

      for (const item of localOnly) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity })
        });
      }

      const merged = [...serverItems, ...localOnly];
      dispatch({ type: 'LOAD_CART', items: merged });
    } catch {}
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch, syncWithServer }}>
      {children}
    </CartContext.Provider>
  );
}
