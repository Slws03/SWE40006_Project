const pool = require('../database/db');

async function getProducts(req, res, next) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let idx = 1;

    if (category) {
      query += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (search) {
      query += ` AND (name ILIKE $${idx} OR description ILIKE $${idx + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = Number(countRows[0].total);

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY category, name LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), offset);

    const { rows: products } = await pool.query(query, params);
    res.json({ products: products.map(p => ({ ...p, price: Number(p.price) })), total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND' });
    res.json({ product: { ...rows[0], price: Number(rows[0].price) } });
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json({ categories: rows.map(r => r.category) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProduct, getCategories };
