// cartRoutes.js — all cart routes are protected (must be logged in)

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Every cart route requires a valid token
router.use(protect);

router.get('/',         getCart);
router.post('/',        addToCart);
router.put('/:id',      updateCartItem);
router.delete('/:id',   removeFromCart);
router.delete('/',      clearCart);

module.exports = router;