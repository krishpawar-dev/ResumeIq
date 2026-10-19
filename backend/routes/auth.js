const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiters');

// Public routes with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
