const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');

// Cart routes
router.route('/:userId')
  .get(getCart)
  .delete(clearCart);

// Cart items routes
router.route('/:userId/items')
  .post(addToCart);

router.route('/:userId/items/:itemId')
  .delete(removeFromCart);

module.exports = router;
