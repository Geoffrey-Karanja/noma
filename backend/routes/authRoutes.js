// authRoutes.js — maps URLs to controller functions

const express        = require('express');
const router         = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { protect }    = require('../middleware/authMiddleware');

// Public routes — no token needed
router.post('/signup', signup);
router.post('/login',  login);

// Protected route — must send a valid token
router.get('/profile', protect, getProfile);

module.exports = router;