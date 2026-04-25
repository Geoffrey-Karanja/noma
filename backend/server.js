// server.js — boots the Express app and connects all routes

const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'noma_super_secret_key';

// Import route files (we'll build these next)
const authRoutes  = require('./routes/authRoutes');
const menuRoutes  = require('./routes/menuRoutes');
const cartRoutes  = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────

// Allow requests from your frontend (any origin in dev)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve your frontend HTML/CSS/JS files statically
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── ROUTES ──────────────────────────────────────────────────

app.use('/api/auth',   authRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/cart',   cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check — visit http://localhost:5000/api/health to confirm server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'NOMA API is live 🚀', time: new Date().toISOString() });
});

// Catch-all — any unknown route returns the frontend (for SPA-style navigation)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── START ───────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🍽️  NOMA server running → http://localhost:${PORT}`);
  console.log(`📦  Database connected`);
  console.log(`🔑  JWT ready\n`);
});