const db = require('../database/db');

const placeOrder = db.transaction((userId, shippingAddress) => {
  const items = db.prepare(`
    SELECT ci.quantity, p.id as productId, p.price, p.name
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `).all(userId);

  if (items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    err.code = 'EMPTY_CART';
    throw err;
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order = db.prepare(
    'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)'
  ).run(userId, total, shippingAddress || null);

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );
  for (const item of items) {
    insertItem.run(order.lastInsertRowid, item.productId, item.quantity, item.price);
  }

  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  return order.lastInsertRowid;
});

function createOrder(req, res, next) {
  try {
    const { shippingAddress } = req.body;
    const orderId = placeOrder(req.user.id, shippingAddress);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(orderId);
    res.status(201).json({ order, items: orderItems });
  } catch (err) {
    next(err);
  }
}

function getOrders(req, res) {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ orders });
}

function getOrder(req, res) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

  const items = db.prepare(`
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json({ order, items });
}

module.exports = { createOrder, getOrders, getOrder };
