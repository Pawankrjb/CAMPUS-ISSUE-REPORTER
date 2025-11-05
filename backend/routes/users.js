const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateUserProfile,
  getFieldHeadsByDepartment
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Get user by ID
router.get('/:userId', verifyToken, getUserById);

// Update user profile
router.put('/:userId', verifyToken, updateUserProfile);

// Get all field heads by department
router.get('/', verifyToken, getFieldHeadsByDepartment);

module.exports = router;
