const cartModel = require('../models/cartModel');

const getCart = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const cart = await cartModel.getCartWithItems(userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { product_id, quantity } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const cart = await cartModel.addItemToCart(userId, {
      product_id,
      quantity: parseInt(quantity) || 1
    });
    
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const itemId = req.params.itemId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const cart = await cartModel.removeItem(userId, itemId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    await cartModel.clearCart(userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
