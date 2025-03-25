const { Cart, CartItem, Product, Category } = require('./index');
const { sequelize } = require('../config/db');

// Get cart for a user, create if doesn't exist
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    where: { user_id: userId }
  });
  
  if (!cart) {
    cart = await Cart.create({
      user_id: userId
    });
  }
  
  return cart;
};

// Get cart with items
const getCartWithItems = async (userId) => {
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [
      {
        model: CartItem,
        include: [
          {
            model: Product,
            include: [Category],
            attributes: ['id', 'name', 'imageUrl', 'price', 'stockCount', 'isAvailable']
          }
        ]
      }
    ]
  });
  
  if (!cart) {
    return await getOrCreateCart(userId);
  }
  
  // Calculate cart totals
  const cartItems = cart.CartItems || [];
  const itemCount = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.Product.price) * item.quantity);
  }, 0);
  
  
  return {
    ...cart.toJSON(),
    itemCount,
    totalQuantity,
    subtotal
  };
};

// Add item to cart
const addItemToCart = async (userId, productData) => {
  try {
    // Get cart or create if doesn't exist
    const cart = await getOrCreateCart(userId);
    
    // Check if product exists and is available
    const product = await Product.findByPk(productData.product_id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (!product.isAvailable) {
      throw new Error('Product is not available');
    }
    
    if (product.stockCount < productData.quantity) {
      throw new Error('Not enough stock available');
    }
    
    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id: product.id
      }
    });
    
    if (cartItem) {
      const newQuantity = cartItem.quantity + (productData.quantity || 1);
      
      if (newQuantity > product.stockCount) {
        throw new Error('Requested quantity exceeds available stock');
      }
      
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: product.id,
        quantity: productData.quantity || 1
      });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    return await getCartWithItems(userId);
  } catch (error) {
    throw error;
  }
};

// Update cart item quantity
const updateCartItem = async (userId, itemId, quantity) => {
  try {
    // Get cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Find cart item
    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cart_id: cart.id
      },
      include: [Product]
    });
    
    if (!cartItem) {
      throw new Error('Item not found in cart');
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      await cartItem.destroy();
    } else {
      // Check if enough stock
      if (quantity > cartItem.Product.stockCount) {
        throw new Error('Requested quantity exceeds available stock');
      }
      
      // Update quantity
      cartItem.quantity = quantity;
      await cartItem.save();
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    return await getCartWithItems(userId);
  } catch (error) {
    throw error;
  }
};

// Remove item from cart
const removeCartItem = async (userId, itemId) => {
  try {
    // Get cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Remove item
    const result = await CartItem.destroy({
      where: {
        id: itemId,
        cart_id: cart.id
      }
    });
    
    if (result === 0) {
      throw new Error('Item not found in cart');
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    return await getCartWithItems(userId);
  } catch (error) {
    throw error;
  }
};

// Clear cart
const clearCart = async (userId) => {
  try {
    // Get cart
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });
    
    if (!cart) {
      return true;
    }
    
    // Remove all items
    await CartItem.destroy({
      where: {
        cart_id: cart.id
      }
    });
    
    cart.updatedAt = new Date();
    await cart.save();
    
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getOrCreateCart,
  getCartWithItems,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
