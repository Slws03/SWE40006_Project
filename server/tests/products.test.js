import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = require('../app');
const pool = require('../database/db');

// Unique prefix per CI run to avoid data collisions
const RUN = `ci_${Date.now()}`;
const email = (tag) => `${RUN}_${tag}@test.com`;

let productIds = [];
let testCategory;

beforeAll(async () => {
  testCategory = `TestCat_${RUN}`;

  const rows = await Promise.all([
    pool.query(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [`${RUN}_Snack`, 'A tasty snack', 1.00, testCategory, 'https://example.com/img.jpg', 50]
    ),
    pool.query(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [`${RUN}_Pen`, 'A good pen', 1.00, testCategory, 'https://example.com/pen.jpg', 100]
    ),
    pool.query(
      'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [`${RUN}_Toy`, 'A fun toy', 1.00, testCategory, 'https://example.com/toy.jpg', 30]
    ),
  ]);

  productIds = rows.map(r => r.rows[0].id);
});

afterAll(async () => {
  // Delete in FK order: order_items → orders → cart_items → users → products
  const { rows: testUsers } = await pool.query(
    "SELECT id FROM users WHERE email LIKE $1",
    [`${RUN}_%`]
  );
  const userIds = testUsers.map(u => u.id);

  if (userIds.length > 0) {
    const { rows: testOrders } = await pool.query(
      'SELECT id FROM orders WHERE user_id = ANY($1)',
      [userIds]
    );
    const orderIds = testOrders.map(o => o.id);

    if (orderIds.length > 0) {
      await pool.query('DELETE FROM order_items WHERE order_id = ANY($1)', [orderIds]);
    }
    await pool.query('DELETE FROM orders WHERE user_id = ANY($1)', [userIds]);
    await pool.query('DELETE FROM cart_items WHERE user_id = ANY($1)', [userIds]);
    await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
  }

  if (productIds.length > 0) {
    await pool.query('DELETE FROM products WHERE id = ANY($1)', [productIds]);
  }

  await pool.end();
});

describe('GET /api/products', () => {
  it('returns our test products in results', async () => {
    const res = await request(app).get(`/api/products?category=${testCategory}`);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
  });

  it('filters by category', async () => {
    const res = await request(app).get(`/api/products?category=${testCategory}`);
    expect(res.status).toBe(200);
    expect(res.body.products.every(p => p.category === testCategory)).toBe(true);
  });

  it('filters by search term', async () => {
    const res = await request(app).get(`/api/products?search=${RUN}_Pen`);
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe(`${RUN}_Pen`);
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app).get('/api/products?search=zzz_no_match_ever');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product by id', async () => {
    const res = await request(app).get(`/api/products/${productIds[0]}`);
    expect(res.status).toBe(200);
    expect(res.body.product.id).toBe(productIds[0]);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/99999999');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/products/categories', () => {
  it('returns our test category in results', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories).toContain(testCategory);
  });
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: email('reg'), password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(email('reg'));
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dup', email: email('dup'), password: 'password123'
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup2', email: email('dup'), password: 'password123'
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_TAKEN');
  });

  it('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'User', email: email('weak'), password: '12'
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WEAK_PASSWORD');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in and returns token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: email('login'), password: 'password123'
    });
    const res = await request(app).post('/api/auth/login').send({
      email: email('login'), password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: email('login'), password: 'wrongpassword'
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Cart API', () => {
  let token;
  const productId = () => productIds[0];

  beforeAll(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Cart User', email: email('cart'), password: 'password123'
    });
    token = reg.body.token;
  });

  it('GET /api/cart returns empty cart for new user', async () => {
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('POST /api/cart adds item to cart', async () => {
    const res = await request(app).post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: productId(), quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('PUT /api/cart/:productId updates quantity', async () => {
    const res = await request(app).put(`/api/cart/${productId()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('DELETE /api/cart/:productId removes item', async () => {
    const res = await request(app).delete(`/api/cart/${productId()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('POST /api/orders creates an order and clears the cart', async () => {
    await request(app).post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: productId(), quantity: 1 });

    const res = await request(app).post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress: '123 Test St, Melbourne VIC 3000' });

    expect(res.status).toBe(201);
    expect(res.body.order.status).toBe('pending');
    expect(res.body.items).toHaveLength(1);

    const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(cart.body.items).toHaveLength(0);
  });

  it('requires auth to access cart', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });
});
