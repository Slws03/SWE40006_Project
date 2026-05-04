const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required', code: 'MISSING_FIELDS' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters', code: 'WEAK_PASSWORD' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered', code: 'EMAIL_TAKEN' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), email.toLowerCase().trim(), hash]
    );

    const token = signToken(rows[0]);
    res.status(201).json({ token, user: safeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required', code: 'MISSING_FIELDS' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const token = signToken(rows[0]);
    res.json({ token, user: safeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
