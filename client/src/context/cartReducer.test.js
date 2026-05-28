import { cartReducer, initialCartState } from './cartReducer';

const product = { id: 1, name: 'Gummy Bears', price: 1.00, image_url: null };

describe('cartReducer', () => {
  it('returns state unchanged for unknown action', () => {
    const state = cartReducer(initialCartState, { type: 'UNKNOWN' });
    expect(state).toBe(initialCartState);
  });

  it('ADD_ITEM adds a new product with given quantity', () => {
    const state = cartReducer(initialCartState, { type: 'ADD_ITEM', product, quantity: 2 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ productId: 1, name: 'Gummy Bears', price: 1.00, quantity: 2 });
  });

  it('ADD_ITEM defaults quantity to 1', () => {
    const state = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    expect(state.items[0].quantity).toBe(1);
  });

  it('ADD_ITEM increments quantity for an existing product', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product, quantity: 1 });
    const s2 = cartReducer(s1, { type: 'ADD_ITEM', product, quantity: 3 });
    expect(s2.items).toHaveLength(1);
    expect(s2.items[0].quantity).toBe(4);
  });

  it('REMOVE_ITEM removes the product', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    const s2 = cartReducer(s1, { type: 'REMOVE_ITEM', productId: 1 });
    expect(s2.items).toHaveLength(0);
  });

  it('REMOVE_ITEM ignores a non-existent productId', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    const s2 = cartReducer(s1, { type: 'REMOVE_ITEM', productId: 999 });
    expect(s2.items).toHaveLength(1);
  });

  it('UPDATE_QTY sets the quantity', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    const s2 = cartReducer(s1, { type: 'UPDATE_QTY', productId: 1, quantity: 5 });
    expect(s2.items[0].quantity).toBe(5);
  });

  it('UPDATE_QTY removes the item when quantity is 0', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    const s2 = cartReducer(s1, { type: 'UPDATE_QTY', productId: 1, quantity: 0 });
    expect(s2.items).toHaveLength(0);
  });

  it('CLEAR_CART empties all items', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    const s2 = cartReducer(s1, { type: 'CLEAR_CART' });
    expect(s2.items).toHaveLength(0);
  });

  it('LOAD_CART replaces items', () => {
    const s1 = cartReducer(initialCartState, { type: 'ADD_ITEM', product });
    const newItems = [{ productId: 2, name: 'Crackers', price: 1.00, quantity: 3 }];
    const s2 = cartReducer(s1, { type: 'LOAD_CART', items: newItems });
    expect(s2.items).toEqual(newItems);
  });

  it('SET_STATUS sets the status field', () => {
    const state = cartReducer(initialCartState, { type: 'SET_STATUS', status: 'loading' });
    expect(state.status).toBe('loading');
  });
});
