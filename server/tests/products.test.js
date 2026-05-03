import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

// Use in-memory SQLite for tests
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const app = require('../app');
const db = require('../database/db');

// Seed test data
beforeAll(() => {
  db.prepare(`INSERT INTO products (name, description, price, category, image_url, stock)
    VALUES ('Test Snack', 'A tasty snack', 1.00, 'Snacks', 'https://example.com/img.jpg', 50)`).run();
  db.prepare(`INSERT INTO products (name, description, price, category, image_url, stock)
    VALUES ('Test Pen', 'A good pen', 1.00, 'Stationery', 'https://example.com/pen.jpg', 100)`).run();
  db.prepare(`INSERT INTO products (name, description, price, category, image_url, stock)
    VALUES ('Test Toy', 'A fun toy', 1.00, 'Toys', 'https://example.com/toy.jpg', 30)`).run();
});

describe('GET /api/products', () => {
  it('returns all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
    expect(res.body.total).toBe(3);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=Snacks');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Test Snack');
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/api/products?search=pen');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Test Pen');
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app).get('/api/products?search=zzz_no_match');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product by id', async () => {
    const all = await request(app).get('/api/products');
    const firstId = all.body.products[0].id;

    const res = await request(app).get(`/api/products/${firstId}`);
    expect(res.status).toBe(200);
    expect(res.body.product.id).toBe(firstId);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/products/categories', () => {
  it('returns all distinct categories', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories).toContain('Snacks');
    expect(res.body.categories).toContain('Stationery');
  });
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dup', email: 'dup@example.com', password: 'password123'
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup2', email: 'dup@example.com', password: 'password123'
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_TAKEN');
  });

  it('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'User', email: 'new@example.com', password: '12'
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WEAK_PASSWORD');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in and returns token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login@example.com', password: 'password123'
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com', password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com', password: 'wrongpassword'
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Cart API', () => {
  let token;
  let productId;

  beforeAll(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Cart User', email: 'cart@example.com', password: 'password123'
    });
    token = reg.body.token;
    const prods = await request(app).get('/api/products');
    productId = prods.body.products[0].id;
  });

  it('GET /api/cart returns empty cart for new user', async () => {
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('POST /api/cart adds item to cart', async () => {
    const res = await request(app).post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('PUT /api/cart/:productId updates quantity', async () => {
    const res = await request(app).put(`/api/cart/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('DELETE /api/cart/:productId removes item', async () => {
    const res = await request(app).delete(`/api/cart/${productId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('POST /api/orders creates an order and clears the cart', async () => {
    // Add item back
    await request(app).post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 1 });

    const res = await request(app).post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress: '123 Test St, Melbourne VIC 3000' });

    expect(res.status).toBe(201);
    expect(res.body.order.status).toBe('pending');
    expect(res.body.items).toHaveLength(1);

    // Cart should be empty
    const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(cart.body.items).toHaveLength(0);
  });

  it('requires auth to access cart', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });
});
