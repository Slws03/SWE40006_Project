export const initialCartState = { items: [], status: 'idle' };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.productId === action.product.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          )
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: action.product.id,
            name: action.product.name,
            price: action.product.price,
            image_url: action.product.image_url,
            quantity: action.quantity ?? 1
          }
        ]
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
    case 'UPDATE_QTY': {
      const qty = Math.max(0, action.quantity);
      if (qty === 0) {
        return { ...state, items: state.items.filter(i => i.productId !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.productId ? { ...i, quantity: qty } : i
        )
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.items };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    default:
      return state;
  }
}
