const db = require('../database/db');

function getProducts(req, res) {
  const { category, search, page = 1, limit = 20 } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countResult = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as total')).get(...params);
  const total = countResult.total;

  const offset = (Number(page) - 1) * Number(limit);
  query += ' ORDER BY category, name LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const products = db.prepare(query).all(...params);
  res.json({ products, total, page: Number(page), limit: Number(limit) });
}

function getProduct(req, res) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND' });
  res.json({ product });
}

function getCategories(req, res) {
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
  res.json({ categories: rows.map(r => r.category) });
}

module.exports = { getProducts, getProduct, getCategories };
