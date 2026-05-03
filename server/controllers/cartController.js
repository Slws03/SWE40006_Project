const db = require('../database/db');

function getCartItems(userId) {
  return db.prepare(`
    SELECT ci.id, ci.quantity, p.id as productId, p.name, p.price, p.image_url, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id
  `).all(userId);
}

function getCart(req, res) {
  res.json({ items: getCartItems(req.user.id) });
}

function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required', code: 'MISSING_FIELDS' });

  const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND' });

  const existing = db.prepare(
    'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, productId);

  if (existing) {
    db.prepare(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?'
    ).run(existing.quantity + Number(quantity), req.user.id, productId);
  } else {
    db.prepare(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
    ).run(req.user.id, productId, Number(quantity));
  }

  res.json({ items: getCartItems(req.user.id) });
}

function updateCartItem(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) return res.status(400).json({ error: 'quantity is required', code: 'MISSING_FIELDS' });

  if (Number(quantity) <= 0) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
  } else {
    db.prepare(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?'
    ).run(Number(quantity), req.user.id, productId);
  }

  res.json({ items: getCartItems(req.user.id) });
}

function removeCartItem(req, res) {
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ items: getCartItems(req.user.id) });
}

function clearCart(req, res) {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ items: [] });
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
