// authController.js — handles signup and login logic

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db/database');

// ─── SIGNUP ──────────────────────────────────────────────────
const signup = (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  // Hash the password — never store plain text
  // 10 = salt rounds (higher = slower but more secure)
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert new user
  const result = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `).run(name, email, hashedPassword);

  // Create JWT token so user is logged in immediately after signup
  const token = jwt.sign(
    { id: result.lastInsertRowid, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id:     result.lastInsertRowid,
      name,
      email,
      points: 0,
      streak: 0
    }
  });
};

// ─── LOGIN ───────────────────────────────────────────────────
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user by email
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Compare entered password against stored hash
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Sign a fresh token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id:     user.id,
      name:   user.name,
      email:  user.email,
      points: user.points,
      streak: user.streak
    }
  });
};

// ─── GET PROFILE ─────────────────────────────────────────────
// Protected route — only works with a valid token
const getProfile = (req, res) => {
  // req.user is set by authMiddleware after verifying the token
  const user = db.prepare('SELECT id, name, email, points, streak, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
};

module.exports = { signup, login, getProfile };