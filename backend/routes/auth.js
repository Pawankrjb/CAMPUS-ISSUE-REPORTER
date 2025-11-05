const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Register with collegeId and password
router.post('/register', register);

// Login with collegeId and password
router.post('/login', login);

// Get current user
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
