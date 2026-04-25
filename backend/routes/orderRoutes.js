// orderRoutes.js — all order routes require login

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { placeOrder, getOrders, getOrderById } = require('../controllers/orderController');

router.use(protect);

router.post('/',    placeOrder);
router.get('/',     getOrders);
router.get('/:id',  getOrderById);

module.exports = router;