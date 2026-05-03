const bcrypt = require('bcryptjs');
const db = require('../database/db');

function getProfile(req, res) {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
  res.json({ user });
}

function updateProfile(req, res) {
  const { name, email } = req.body;
  if (!name && !email) return res.status(400).json({ error: 'Nothing to update', code: 'MISSING_FIELDS' });

  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const newName = name ? name.trim() : current.name;
  const newEmail = email ? email.toLowerCase().trim() : current.email;

  if (newEmail !== current.email) {
    const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(newEmail, req.user.id);
    if (conflict) return res.status(409).json({ error: 'Email already taken', code: 'EMAIL_TAKEN' });
  }

  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(newName, newEmail, req.user.id);
  const updated = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: updated });
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

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect', code: 'INVALID_PASSWORD' });

    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, updatePassword };
