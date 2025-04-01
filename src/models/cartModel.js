const Cart = require('./cartSchema');
const Product = require('./productSchema');

// Get a cart by user ID
const getByUser = async (userId) => {
  return await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    model: 'Product'
  });
};

// Create a new cart for a user
const create = async (userId) => {
  const newCart = new Cart({
    user: userId,
    items: [],
    total: 0
  });
  
  return await newCart.save();
};

// Add item to cart
const addItem = async (userId, productId, quantity) => {
  const cart = await getByUser(userId) || await create(userId);
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check if item already exists in cart
  const itemIndex = cart.items.findIndex(item => 
    item.product._id.toString() === productId.toString()
  );
  
  if (itemIndex > -1) {
    // Item exists, update quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Item does not exist, add new item
    cart.items.push({
      product: productId,
      quantity: quantity,
      price: product.price
    });
  }
  
  // Recalculate total
  cart.total = cart.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  await cart.save();
  
  return await getByUser(userId);
};

// Update item quantity
const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await getByUser(userId);
  
  if (!cart) {
    throw new Error('Cart not found');
  }
  
  const itemIndex = cart.items.findIndex(item => 
    item.product._id.toString() === productId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is zero or negative
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }
  
  // Recalculate total
  cart.total = cart.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  await cart.save();
  
  return await getByUser(userId);
};

// Remove item from cart
const removeItem = async (userId, productId) => {
  const cart = await getByUser(userId);
  
  if (!cart) {
    throw new Error('Cart not found');
  }
  
  cart.items = cart.items.filter(item => 
    item.product._id.toString() !== productId.toString()
  );
  
  // Recalculate total
  cart.total = cart.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  await cart.save();
  
  return await getByUser(userId);
};

// Clear cart
const clearCart = async (userId) => {
  const cart = await getByUser(userId);
  
  if (!cart) {
    throw new Error('Cart not found');
  }
  
  cart.items = [];
  cart.total = 0;
  
  await cart.save();
  
  return cart;
};

module.exports = {
  getByUser,
  create,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
};
