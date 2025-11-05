const User = require('../models/User');

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, department } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.department = department || user.department;
    
    await user.save();
    
    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all field heads by department
const getFieldHeadsByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    
    let query = { role: 'field_head' };
    
    if (department) {
      query.department = department;
    }
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error in getFieldHeadsByDepartment:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserById,
  updateUserProfile,
  getFieldHeadsByDepartment
};