// cartController.js — add, update, remove, and view cart items

const db = require('../db/database');

// ─── GET CART ─────────────────────────────────────────────────
const getCart = (req, res) => {
  const userId = req.user.id;

  // Join with menu_items and restaurants to get full item details
  const items = db.prepare(`
    SELECT
      c.id          as cart_id,
      c.quantity,
      m.id          as item_id,
      m.name,
      m.description,
      m.price,
      m.image_emoji,
      m.category,
      r.id          as restaurant_id,
      r.name        as restaurant_name,
      (c.quantity * m.price) as subtotal
    FROM cart c
    JOIN menu_items m ON c.menu_item_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE c.user_id = ?
  `).all(userId);

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  res.json({
    items,
    total: Math.round(total * 100) / 100,  // round to 2 decimal places
    item_count: items.reduce((sum, item) => sum + item.quantity, 0)
  });
};

// ─── ADD TO CART ──────────────────────────────────────────────
const addToCart = (req, res) => {
  const userId = req.user.id;
  const { menu_item_id, quantity = 1 } = req.body;

  if (!menu_item_id) {
    return res.status(400).json({ error: 'menu_item_id is required' });
  }

  // Check item exists and is available
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ? AND is_available = 1').get(menu_item_id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found or unavailable' });
  }

  // INSERT OR REPLACE handles the unique constraint —
  // if item already in cart, update quantity instead of erroring
  db.prepare(`
    INSERT INTO cart (user_id, menu_item_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, menu_item_id)
    DO UPDATE SET quantity = quantity + excluded.quantity
  `).run(userId, menu_item_id, quantity);

  res.json({ message: `${item.name} added to cart` });
};

// ─── UPDATE QUANTITY ──────────────────────────────────────────
const updateCartItem = (req, res) => {
  const userId   = req.user.id;
  const { id }   = req.params;  // cart row id
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const result = db.prepare(`
    UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?
  `).run(quantity, id, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json({ message: 'Quantity updated' });
};

// ─── REMOVE ITEM ──────────────────────────────────────────────
const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = db.prepare(`
    DELETE FROM cart WHERE id = ? AND user_id = ?
  `).run(id, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json({ message: 'Item removed from cart' });
};

// ─── CLEAR ENTIRE CART ────────────────────────────────────────
const clearCart = (req, res) => {
  db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };