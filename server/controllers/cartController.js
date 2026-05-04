const pool = require('../database/db');

async function getCartItems(userId) {
  const { rows } = await pool.query(`
    SELECT ci.id, ci.quantity,
           p.id as "productId", p.name, p.price, p.image_url, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
    ORDER BY ci.id
  `, [userId]);
  return rows.map(r => ({ ...r, price: Number(r.price) }));
}

async function getCart(req, res, next) {
  try {
    res.json({ items: await getCartItems(req.user.id) });
  } catch (err) { next(err); }
}

async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required', code: 'MISSING_FIELDS' });

    const { rows: prod } = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (prod.length === 0) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND' });

    const { rows: existing } = await pool.query(
      'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
        [existing[0].quantity + Number(quantity), req.user.id, productId]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, productId, Number(quantity)]
      );
    }

    res.json({ items: await getCartItems(req.user.id) });
  } catch (err) { next(err); }
}

async function updateCartItem(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: 'quantity is required', code: 'MISSING_FIELDS' });

    if (Number(quantity) <= 0) {
      await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
        [Number(quantity), req.user.id, productId]
      );
    }

    res.json({ items: await getCartItems(req.user.id) });
  } catch (err) { next(err); }
}

async function removeCartItem(req, res, next) {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.productId]);
    res.json({ items: await getCartItems(req.user.id) });
  } catch (err) { next(err); }
}

async function clearCart(req, res, next) {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ items: [] });
  } catch (err) { next(err); }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
