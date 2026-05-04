-- Run this in Supabase SQL Editor to set up the schema

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT   NOT NULL,
  email      TEXT   NOT NULL UNIQUE,
  password   TEXT   NOT NULL,
  role       TEXT   NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT           NOT NULL,
  description TEXT,
  price       NUMERIC(10,2)  NOT NULL DEFAULT 1.00,
  category    TEXT           NOT NULL DEFAULT 'general',
  image_url   TEXT,
  stock       INTEGER        NOT NULL DEFAULT 100,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER        NOT NULL REFERENCES users(id),
  total_amount     NUMERIC(10,2)  NOT NULL,
  status           TEXT           NOT NULL DEFAULT 'pending',
  shipping_address TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER        NOT NULL REFERENCES products(id),
  quantity   INTEGER        NOT NULL,
  unit_price NUMERIC(10,2)  NOT NULL
);
