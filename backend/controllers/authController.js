const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register with collegeId and password
const register = async (req, res) => {
  try {
    const { collegeId, password, name, role, department } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ collegeId });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this college ID' });
    }

    // Create user
    const user = new User({
      collegeId,
      password,
      name,
      role: role || 'user',
      department
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        collegeId: user.collegeId,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login with collegeId and password
const login = async (req, res) => {
  try {
    const { collegeId, password, role } = req.body;

    // Check if user exists with the given role
    const user = await User.findOne({ collegeId, role });

    if (!user) {
      return res.status(404).json({ error: `User not found with role '${role}'` });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        collegeId: user.collegeId,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // Fetch fresh user data from database to ensure updated roles are reflected
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
