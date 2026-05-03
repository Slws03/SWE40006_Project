import { createContext, useReducer, useEffect, useCallback } from 'react';
import { cartReducer, initialCartState } from './cartReducer';

const STORAGE_KEY = 'dollar_shop_cart';

// Not exported — consume via useCart() hook only
export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...init, items: JSON.parse(saved) };
    } catch {
      // Corrupted localStorage — fall back to empty cart
    }
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
      const serverItems = items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        image_url: i.image_url,
        quantity: i.quantity
      }));

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

      dispatch({ type: 'LOAD_CART', items: [...serverItems, ...localOnly] });
    } catch {
      // Network error — keep local cart as-is
    }
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch, syncWithServer }}>
      {children}
    </CartContext.Provider>
  );
}
