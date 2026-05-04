const pool = require('../database/db');

async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: items } = await client.query(`
      SELECT ci.quantity, p.id as "productId", p.price, p.name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
    `, [req.user.id]);

    if (items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty', code: 'EMPTY_CART' });
    }

    const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const { rows: [order] } = await client.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, total, req.body.shippingAddress || null]
    );

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.productId, item.quantity, item.price]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    await client.query('COMMIT');

    const { rows: orderItems } = await pool.query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
    `, [order.id]);

    res.status(201).json({
      order: { ...order, total_amount: Number(order.total_amount) },
      items: orderItems.map(i => ({ ...i, unit_price: Number(i.unit_price) }))
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function getOrders(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders: rows.map(o => ({ ...o, total_amount: Number(o.total_amount) })) });
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });

    const { rows: items } = await pool.query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
    `, [rows[0].id]);

    res.json({ order: rows[0], items });
  } catch (err) { next(err); }
}

module.exports = { createOrder, getOrders, getOrder };
