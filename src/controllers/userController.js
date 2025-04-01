const userModel = require('../models/userModel');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAll();
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error getting users:', error.message);
    const err = new Error('Server error while retrieving users');
    err.status = 500;
    next(err);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.getById(id);
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user:', error.message);
    next(error);
  }
};

// Update a user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userModel.getById(id);
    if (!existingUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    
    const updates = req.body;
    
    // If username is being changed, check if it's already taken
    if (updates.username && updates.username !== existingUser.username) {
      const userWithUsername = await userModel.getByUsername(updates.username);
      if (userWithUsername) {
        const error = new Error('Username already exists');
        error.status = 400;
        throw error;
      }
    }
    
    // If email is being changed, check if it's already taken
    if (updates.email && updates.email !== existingUser.email) {
      const userWithEmail = await userModel.getByEmail(updates.email);
      if (userWithEmail) {
        const error = new Error('Email already exists');
        error.status = 400;
        throw error;
      }
    }
    
    // Update only the fields that are provided
    const updatedUser = await userModel.update(id, updates);
    
    res.json({ 
      success: true,
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error.message);
    next(error);
  }
};

// Delete a user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userModel.getById(id);
    if (!existingUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    
    const result = await userModel.remove(id);
    
    if (result) {
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      const error = new Error('Failed to delete user');
      error.status = 500;
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error.message);
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const existingUser = await userModel.getByUsername(username) || await userModel.getByEmail(email);
    if (existingUser) {
      const error = new Error('Username or email already exists');
      error.status = 400;
      throw error;
    }

    // Create new user
    const newUser = await userModel.create({ username, email, password, first_name, last_name });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser
};
