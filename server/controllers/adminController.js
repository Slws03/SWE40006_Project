const { createClient } = require('@supabase/supabase-js');
const pool = require('../database/db');

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function createProduct(req, res, next) {
  try {
    const { name, description, category, stock } = req.body;
    const price = 1.00;

    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required', code: 'MISSING_FIELDS' });
    }

    let image_url = null;

    if (req.file) {
      const supabase = getSupabase();
      const ext = req.file.originalname.split('.').pop();
      const path = `${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('products')
        .upload(path, req.file.buffer, { contentType: req.file.mimetype });

      if (error) return next(error);

      const { data } = supabase.storage.from('products').getPublicUrl(path);
      image_url = data.publicUrl;
    }

    const { rows } = await pool.query(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name.trim(), description?.trim() || null, price, category.trim(), image_url, Number(stock) || 100]
    );

    res.status(201).json({ product: { ...rows[0], price: Number(rows[0].price) } });
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const { rows: orders } = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at,
             u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    const orderIds = orders.map(o => o.id);
    let itemsByOrder = {};

    if (orderIds.length > 0) {
      const { rows: items } = await pool.query(`
        SELECT oi.order_id, oi.quantity, oi.unit_price, p.name, p.image_url
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ANY($1)
      `, [orderIds]);

      for (const item of items) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({ ...item, unit_price: Number(item.unit_price) });
      }
    }

    const result = orders.map(o => ({
      ...o,
      total_amount: Number(o.total_amount),
      items: itemsByOrder[o.id] || []
    }));

    res.json({ orders: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { createProduct, getAllOrders };
