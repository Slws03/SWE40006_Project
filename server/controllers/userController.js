const bcrypt = require('bcryptjs');
const pool = require('../database/db');

async function getProfile(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name && !email) return res.status(400).json({ error: 'Nothing to update', code: 'MISSING_FIELDS' });

    const { rows: current } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const newName = name ? name.trim() : current[0].name;
    const newEmail = email ? email.toLowerCase().trim() : current[0].email;

    if (newEmail !== current[0].email) {
      const { rows: conflict } = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [newEmail, req.user.id]
      );
      if (conflict.length > 0) return res.status(409).json({ error: 'Email already taken', code: 'EMAIL_TAKEN' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role, created_at',
      [newName, newEmail, req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required', code: 'MISSING_FIELDS' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters', code: 'WEAK_PASSWORD' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect', code: 'INVALID_PASSWORD' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, updatePassword };
