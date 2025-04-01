const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidatorMiddleware = require('../middleware/userValidatorMiddleware');

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userValidatorMiddleware, userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Create user
router.post('/', userValidatorMiddleware, userController.createUser);

module.exports = router;
