import { renderHook, act } from '@testing-library/react';
import { CartProvider } from '../context/CartContext';
import { useCart } from './useCart';

vi.mock('../api/cart', () => ({
  cartApi: {
    get: vi.fn().mockResolvedValue({ items: [] }),
    add: vi.fn().mockResolvedValue({}),
  },
}));

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
const product = { id: 1, name: 'Gummy Bears', price: 1.00, image_url: null };

describe('useCart', () => {
  beforeEach(() => localStorage.clear());

  it('throws when used outside CartProvider', () => {
    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within CartProvider');
  });

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('ADD_ITEM adds a product to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product, quantity: 2 }));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('ADD_ITEM increments quantity for an existing product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product, quantity: 1 }));
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product, quantity: 2 }));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it('computes itemCount correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product, quantity: 3 }));
    expect(result.current.itemCount).toBe(3);
  });

  it('computes totalAmount correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product, quantity: 3 }));
    expect(result.current.totalAmount).toBeCloseTo(3.00);
  });

  it('REMOVE_ITEM removes the product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product }));
    act(() => result.current.dispatch({ type: 'REMOVE_ITEM', productId: 1 }));
    expect(result.current.items).toHaveLength(0);
  });

  it('UPDATE_QTY updates the quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product }));
    act(() => result.current.dispatch({ type: 'UPDATE_QTY', productId: 1, quantity: 5 }));
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('CLEAR_CART resets to empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.dispatch({ type: 'ADD_ITEM', product }));
    act(() => result.current.dispatch({ type: 'CLEAR_CART' }));
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });
});
