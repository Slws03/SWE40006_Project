import { describe, it, expect } from 'vitest';
import { cartReducer, initialCartState } from '../context/cartReducer';

const sampleProduct = { id: 1, name: 'Gummy Bears', price: 1.00, image_url: 'https://example.com/img.jpg' };
const sampleProduct2 = { id: 2, name: 'Popcorn Bag', price: 1.00, image_url: 'https://example.com/img2.jpg' };

describe('cartReducer', () => {
  it('ADD_ITEM adds a new product to an empty cart', () => {
    const state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 1 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(1);
    expect(state.items[0].name).toBe('Gummy Bears');
    expect(state.items[0].quantity).toBe(1);
  });

  it('ADD_ITEM increments quantity when the same product is added again', () => {
    const withOne = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 2 });
    const withTwo = cartReducer(withOne, { type: 'ADD_ITEM', product: sampleProduct, quantity: 3 });
    expect(withTwo.items).toHaveLength(1);
    expect(withTwo.items[0].quantity).toBe(5);
  });

  it('ADD_ITEM appends a different product without affecting existing items', () => {
    const withFirst = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 1 });
    const withBoth = cartReducer(withFirst, { type: 'ADD_ITEM', product: sampleProduct2, quantity: 2 });
    expect(withBoth.items).toHaveLength(2);
  });

  it('REMOVE_ITEM removes the correct product', () => {
    let state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 1 });
    state = cartReducer(state, { type: 'ADD_ITEM', product: sampleProduct2, quantity: 1 });
    state = cartReducer(state, { type: 'REMOVE_ITEM', productId: 1 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(2);
  });

  it('UPDATE_QTY updates the quantity of an item', () => {
    let state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 1 });
    state = cartReducer(state, { type: 'UPDATE_QTY', productId: 1, quantity: 7 });
    expect(state.items[0].quantity).toBe(7);
  });

  it('UPDATE_QTY with 0 removes the item from the cart', () => {
    let state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 3 });
    state = cartReducer(state, { type: 'UPDATE_QTY', productId: 1, quantity: 0 });
    expect(state.items).toHaveLength(0);
  });

  it('CLEAR_CART empties all items', () => {
    let state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 2 });
    state = cartReducer(state, { type: 'ADD_ITEM', product: sampleProduct2, quantity: 1 });
    state = cartReducer(state, { type: 'CLEAR_CART' });
    expect(state.items).toHaveLength(0);
  });

  it('LOAD_CART replaces items entirely', () => {
    let state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 5 });
    const newItems = [{ productId: 99, name: 'Other', price: 1.00, image_url: '', quantity: 3 }];
    state = cartReducer(state, { type: 'LOAD_CART', items: newItems });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(99);
  });

  it('computes totalAmount correctly across multiple items', () => {
    let state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct, quantity: 3 });
    state = cartReducer(state, { type: 'ADD_ITEM', product: sampleProduct2, quantity: 2 });
    const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    expect(total).toBeCloseTo(5.00);
  });

  it('ADD_ITEM uses quantity 1 by default when quantity is omitted', () => {
    const state = cartReducer(initialCartState, { type: 'ADD_ITEM', product: sampleProduct });
    expect(state.items[0].quantity).toBe(1);
  });
});
