// menuController.js — handles restaurants and menu items

const db = require('../db/database');

// ─── GET ALL RESTAURANTS ──────────────────────────────────────
const getRestaurants = (req, res) => {
  const { cuisine, search } = req.query;

  let query = 'SELECT * FROM restaurants WHERE is_open = 1';
  const params = [];

  // Filter by cuisine if provided — e.g. /api/menu/restaurants?cuisine=Japanese
  if (cuisine) {
    query += ' AND cuisine LIKE ?';
    params.push(`%${cuisine}%`);
  }

  // Search by name if provided — e.g. /api/menu/restaurants?search=sakura
  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY rating DESC';

  const restaurants = db.prepare(query).all(...params);
  res.json({ restaurants });
};

// ─── GET SINGLE RESTAURANT + ITS MENU ────────────────────────
const getRestaurantById = (req, res) => {
  const { id } = req.params;

  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id);

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  // Get all available menu items for this restaurant
  const menuItems = db.prepare(`
    SELECT * FROM menu_items
    WHERE restaurant_id = ? AND is_available = 1
    ORDER BY category, name
  `).all(id);

  // Group items by category for easier frontend rendering
  // e.g. { Ramen: [...], Sides: [...] }
  const menu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({ restaurant, menu });
};

// ─── GET ALL MENU ITEMS (with optional filters) ───────────────
const getMenuItems = (req, res) => {
  const { restaurant_id, category, max_price } = req.query;

  let query = 'SELECT * FROM menu_items WHERE is_available = 1';
  const params = [];

  if (restaurant_id) {
    query += ' AND restaurant_id = ?';
    params.push(restaurant_id);
  }

  if (category) {
    query += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }

  // Budget filter — e.g. /api/menu/items?max_price=10
  if (max_price) {
    query += ' AND price <= ?';
    params.push(parseFloat(max_price));
  }

  query += ' ORDER BY price ASC';

  const items = db.prepare(query).all(...params);
  res.json({ items });
};

// ─── SURPRISE ME — random menu item ──────────────────────────
const getSurprise = (req, res) => {
  const { max_price } = req.query;

  let query = `
    SELECT m.*, r.name as restaurant_name, r.delivery_time
    FROM menu_items m
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE m.is_available = 1 AND r.is_open = 1
  `;
  const params = [];

  if (max_price) {
    query += ' AND m.price <= ?';
    params.push(parseFloat(max_price));
  }

  query += ' ORDER BY RANDOM() LIMIT 1';

  const item = db.prepare(query).get(...params);

  if (!item) {
    return res.status(404).json({ error: 'No items found' });
  }

  res.json({ surprise: item });
};

module.exports = { getRestaurants, getRestaurantById, getMenuItems, getSurprise };