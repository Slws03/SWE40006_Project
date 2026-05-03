import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '../context/CartContext';
import { useCart } from '../hooks/useCart';

// Suppress console noise from fetch (not mocked for context tests)
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function CartTestHarness() {
  const { items, itemCount, totalAmount, dispatch } = useCart();
  return (
    <div>
      <p data-testid="count">{itemCount}</p>
      <p data-testid="total">{totalAmount.toFixed(2)}</p>
      <p data-testid="items">{items.map(i => `${i.name}:${i.quantity}`).join(',')}</p>
      <button onClick={() => dispatch({ type: 'ADD_ITEM', product: { id: 1, name: 'Crackers', price: 1.00, image_url: '' }, quantity: 1 })}>
        Add Crackers
      </button>
      <button onClick={() => dispatch({ type: 'ADD_ITEM', product: { id: 2, name: 'Popcorn', price: 1.00, image_url: '' }, quantity: 2 })}>
        Add Popcorn
      </button>
      <button onClick={() => dispatch({ type: 'REMOVE_ITEM', productId: 1 })}>
        Remove Crackers
      </button>
      <button onClick={() => dispatch({ type: 'UPDATE_QTY', productId: 1, quantity: 5 })}>
        Set Crackers 5
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
        Clear
      </button>
    </div>
  );
}

function renderCart() {
  render(<CartProvider><CartTestHarness /></CartProvider>);
}

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0.00');
  });

  it('adds item and updates count and total', async () => {
    renderCart();
    await userEvent.click(screen.getByText('Add Crackers'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('1.00');
  });

  it('adding same item increments quantity', async () => {
    renderCart();
    await userEvent.click(screen.getByText('Add Crackers'));
    await userEvent.click(screen.getByText('Add Crackers'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('items').textContent).toBe('Crackers:2');
  });

  it('adding different items accumulates correctly', async () => {
    renderCart();
    await userEvent.click(screen.getByText('Add Crackers'));
    await userEvent.click(screen.getByText('Add Popcorn'));
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('total').textContent).toBe('3.00');
  });

  it('removes an item', async () => {
    renderCart();
    await userEvent.click(screen.getByText('Add Crackers'));
    await userEvent.click(screen.getByText('Remove Crackers'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('updates quantity', async () => {
    renderCart();
    await userEvent.click(screen.getByText('Add Crackers'));
    await userEvent.click(screen.getByText('Set Crackers 5'));
    expect(screen.getByTestId('count').textContent).toBe('5');
    expect(screen.getByTestId('total').textContent).toBe('5.00');
  });

  it('clears the cart', async () => {
    renderCart();
    await userEvent.click(screen.getByText('Add Crackers'));
    await userEvent.click(screen.getByText('Add Popcorn'));
    await userEvent.click(screen.getByText('Clear'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('items').textContent).toBe('');
  });
});
