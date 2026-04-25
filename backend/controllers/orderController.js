// orderController.js — place orders, track status, view history

const db = require('../db/database');

// ─── PLACE ORDER ──────────────────────────────────────────────
const placeOrder = (req, res) => {
  const userId  = req.user.id;
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  // Get everything currently in the user's cart
  const cartItems = db.prepare(`
    SELECT
      c.quantity,
      m.id          as menu_item_id,
      m.name,
      m.price,
      m.restaurant_id
    FROM cart c
    JOIN menu_items m ON c.menu_item_id = m.id
    WHERE c.user_id = ?
  `).all(userId);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  // Make sure all items are from the same restaurant
  const restaurantIds = [...new Set(cartItems.map(i => i.restaurant_id))];
  if (restaurantIds.length > 1) {
    return res.status(400).json({ error: 'All items must be from the same restaurant' });
  }

  const restaurantId = restaurantIds[0];
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const roundedTotal = Math.round(total * 100) / 100;

  // Use a transaction — if anything fails, nothing gets saved
  // This prevents half-orders being created
  const placeOrderTransaction = db.transaction(() => {
    // Create the order
    const order = db.prepare(`
      INSERT INTO orders (user_id, restaurant_id, total, address, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `).run(userId, restaurantId, roundedTotal, address);

    const orderId = order.lastInsertRowid;

    // Save each cart item as an order item
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of cartItems) {
      insertItem.run(orderId, item.menu_item_id, item.quantity, item.price);
    }

    // Award points — 1 point per dollar spent
    const pointsEarned = Math.floor(roundedTotal);
    db.prepare(`
      UPDATE users SET points = points + ? WHERE id = ?
    `).run(pointsEarned, userId);

    // Update streak — if last order was yesterday or today, increment
    // otherwise reset to 1
    const user = db.prepare('SELECT last_order, streak FROM users WHERE id = ?').get(userId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = 1;
    if (user.last_order === yesterday) {
      newStreak = user.streak + 1;
    } else if (user.last_order === today) {
      newStreak = user.streak; // already ordered today, keep streak
    }

    db.prepare(`
      UPDATE users SET last_order = ?, streak = ? WHERE id = ?
    `).run(today, newStreak, userId);

    // Clear the cart after successful order
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(userId);

    return orderId;
  });

  const orderId = placeOrderTransaction();

  res.status(201).json({
    message: 'Order placed successfully!',
    order_id: orderId,
    total: roundedTotal,
    status: 'confirmed',
    estimated_delivery: '25-35 min',
    points_earned: Math.floor(roundedTotal)
  });
};

// ─── GET ORDER HISTORY ────────────────────────────────────────
const getOrders = (req, res) => {
  const userId = req.user.id;

  const orders = db.prepare(`
    SELECT
      o.id,
      o.total,
      o.status,
      o.address,
      o.created_at,
      r.name  as restaurant_name,
      r.image_emoji
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId);

  res.json({ orders });
};

// ─── GET SINGLE ORDER WITH ITEMS ─────────────────────────────
const getOrderById = (req, res) => {
  const userId   = req.user.id;
  const { id }   = req.params;

  const order = db.prepare(`
    SELECT
      o.*,
      r.name  as restaurant_name,
      r.image_emoji
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = ? AND o.user_id = ?
  `).get(id, userId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare(`
    SELECT
      oi.quantity,
      oi.price,
      m.name,
      m.image_emoji,
      (oi.quantity * oi.price) as subtotal
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `).all(id);

  // Simulate real-time status based on time elapsed
  const createdAt  = new Date(order.created_at);
  const elapsedMin = (Date.now() - createdAt.getTime()) / 60000;

  let status = 'confirmed';
  if (elapsedMin > 2)  status = 'preparing';
  if (elapsedMin > 10) status = 'on the way';
  if (elapsedMin > 25) status = 'delivered';

  res.json({ ...order, status, items });
};

module.exports = { placeOrder, getOrders, getOrderById };