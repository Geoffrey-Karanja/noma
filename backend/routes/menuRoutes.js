// menuRoutes.js — maps menu URLs to controller functions

const express = require('express');
const router  = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  getMenuItems,
  getSurprise
} = require('../controllers/menuController');

// All menu routes are public — no login required to browse
router.get('/restaurants',        getRestaurants);
router.get('/restaurants/:id',    getRestaurantById);
router.get('/items',              getMenuItems);
router.get('/surprise',           getSurprise);

module.exports = router;