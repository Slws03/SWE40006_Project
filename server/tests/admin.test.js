import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = require('../app');
const pool = require('../database/db');

const RUN = `ci_admin_${Date.now()}`;
const email = (tag) => `${RUN}_${tag}@test.com`;

let adminToken;
let customerToken;
let testProductId;
let testUserId;

beforeAll(async () => {
  // Create admin user directly in DB
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.hash('password123', 10);

  const { rows: [admin] } = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'admin') RETURNING *",
    ['Test Admin', email('admin'), hash]
  );
  testUserId = admin.id;

  // Sign admin token manually
  const jwt = await import('jsonwebtoken');
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Register a regular customer
  const res = await request(app).post('/api/auth/register').send({
    name: 'Customer', email: email('customer'), password: 'password123'
  });
  customerToken = res.body.token;

  // Insert a test product
  const { rows: [product] } = await pool.query(
    'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [`${RUN}_Product`, 'Test product', 1.00, 'Snacks', null, 50]
  );
  testProductId = product.id;
});

afterAll(async () => {
  // Clean up: order_items → orders → cart_items → users → products
  const { rows: users } = await pool.query(
    "SELECT id FROM users WHERE email LIKE $1", [`${RUN}_%`]
  );
  const userIds = users.map(u => u.id);

  if (userIds.length > 0) {
    const { rows: orders } = await pool.query(
      'SELECT id FROM orders WHERE user_id = ANY($1)', [userIds]
    );
    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      await pool.query('DELETE FROM order_items WHERE order_id = ANY($1)', [orderIds]);
    }
    await pool.query('DELETE FROM orders WHERE user_id = ANY($1)', [userIds]);
    await pool.query('DELETE FROM cart_items WHERE user_id = ANY($1)', [userIds]);
    await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
  }

  await pool.query("DELETE FROM products WHERE name LIKE $1", [`${RUN}_%`]);
  await pool.end();
});

// ─── Role protection ──────────────────────────────────────────────────────────

describe('Admin route protection', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/orders');
    expect(res.status).toBe(401);
  });

  it('rejects customer token with 403', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows admin token', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

// ─── GET /api/admin/orders ────────────────────────────────────────────────────

describe('GET /api/admin/orders', () => {
  it('returns orders array with customer info', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('each order has customer_name and customer_email', async () => {
    // Create an order for the customer
    await request(app).post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId, quantity: 1 });
    await request(app).post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingAddress: '123 Test St' });

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const order = res.body.orders.find(o => o.customer_email === email('customer'));
    expect(order).toBeDefined();
    expect(order.customer_name).toBe('Customer');
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBeGreaterThan(0);
  });
});

// ─── POST /api/admin/products ─────────────────────────────────────────────────

describe('POST /api/admin/products', () => {
  let createdId;

  afterAll(async () => {
    if (createdId) await pool.query('DELETE FROM products WHERE id = $1', [createdId]);
  });

  it('creates a product without image', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', `${RUN}_NewProduct`)
      .field('description', 'A test product')
      .field('category', 'Snacks')
      .field('stock', '99');

    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe(`${RUN}_NewProduct`);
    expect(res.body.product.category).toBe('Snacks');
    expect(res.body.product.stock).toBe(99);
    createdId = res.body.product.id;
  });

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('category', 'Snacks');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('MISSING_FIELDS');
  });

  it('rejects invalid category', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', `${RUN}_Bad`)
      .field('category', 'InvalidCat');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CATEGORY');
  });
});

// ─── PUT /api/admin/products/:id ──────────────────────────────────────────────

describe('PUT /api/admin/products/:id', () => {
  it('updates product fields', async () => {
    const res = await request(app)
      .put(`/api/admin/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', `${RUN}_Updated`)
      .field('description', 'Updated desc')
      .field('category', 'Toys')
      .field('stock', '77');

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe(`${RUN}_Updated`);
    expect(res.body.product.category).toBe('Toys');
    expect(res.body.product.stock).toBe(77);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app)
      .put('/api/admin/products/99999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Ghost')
      .field('category', 'Snacks')
      .field('stock', '1');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

// ─── DELETE /api/admin/products/:id ──────────────────────────────────────────

describe('DELETE /api/admin/products/:id', () => {
  it('deletes a product', async () => {
    const { rows: [p] } = await pool.query(
      'INSERT INTO products (name, description, price, category, stock) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [`${RUN}_ToDelete`, 'temp', 1.00, 'Snacks', 10]
    );

    const res = await request(app)
      .delete(`/api/admin/products/${p.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { rows } = await pool.query('SELECT id FROM products WHERE id = $1', [p.id]);
    expect(rows).toHaveLength(0);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app)
      .delete('/api/admin/products/99999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
